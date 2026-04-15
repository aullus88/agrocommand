# Multi-Tenant Implementation Plan

**Status:** Draft
**Target stack:** Next.js 16 (App Router) · React 19 · Supabase (Postgres + Auth) · TanStack Query · Zustand · shadcn/ui
**Scope:** Harden tenant isolation end-to-end and ship the UI needed to operate a multi-tenant SaaS (organizations, members, billing/limits, audit).

---

## 1. Context & current state

AgroCommand already has a multi-tenant **foundation** in the database:

- Tenancy model: `organizations` (tenant root) → `organization_members` (user↔org with role + permissions JSONB) → `farms` (belongs to org) → everything else scoped by `organization_id` and/or `farm_id`.
- Helper functions exist: `get_current_organization_id`, `get_user_organization_ids`, `get_user_organization_role`, `user_has_organization_access`, `is_super_admin`, `set_organization_id_from_context` (trigger), `validate_organization_limits` (trigger).
- `organizations` carries plan limits: `subscription_plan`, `max_farms`, `max_users`, `max_hectares`, `trial_ends_at`, `status` (`active|trial|suspended|cancelled`).
- RLS policies on `organizations`, `organization_members`, `farms`, `user_profiles` already use the helper functions correctly.

**What's missing / broken:**

1. **RLS disabled on tenant tables** holding financial data:
   `debt_portfolio`, `sales_contracts`, `debt_payment_schedule`, `chart_of_accounts`, `cost_centers`, `debt_portfolio_backup_20250730`.
2. **Child tables with no tenant column and no RLS**:
   `debt_payments`, `plantings`, `lease_payments`, `lease_plot_allocations`, `operation_input_usage`, `inventory_movements{,_2024,_2025,_2026}`, `transaction_line_items`, `report_cache`, `report_generation_log`, `scheduled_reports`.
3. **`SECURITY DEFINER` views bypass RLS** — flagged by Supabase advisor (e.g. `cost_per_hectare_analysis`, `current_*` views).
4. **No current-org session context** in the app — the client has no concept of "selected org", and Supabase has no way to know which org a user is acting under when they belong to multiple.
5. **No UI** for: org selection/switching, org settings, member management, invite flow, billing/plan status, usage vs. limits, audit log, leaving an org, deleting an org.
6. **Hardcoded user data** in sidebar (`components/app-sidebar.tsx:201-205` uses `name: 'shadcn'`, `email: 'm@example.com'`) — needs org-aware user dropdown.
7. `user_profiles.is_super_admin` exists but no admin surface uses it.

This plan addresses all of the above.

---

## 2. Design decisions

### 2.1 How we identify the "current org" for a request

Supabase JWTs don't naturally carry a per-request "active org" claim, because a user can belong to many orgs and switch between them at runtime. Two complementary mechanisms:

**A. Session cookie (primary)** — `ac_current_org` HTTP-only cookie holds the active `organization_id`. Every server-side `createClient()` reads it and passes it down via a Postgres session setting (`set_config('app.current_org', $1, true)`). A server helper `getCurrentOrgId()` returns it and verifies the user is a member.

**B. JWT custom claim (optional, faster)** — we can install a [Supabase custom access token hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) that injects the user's `organization_ids` and `default_org_id` into `app_metadata`. This avoids an extra DB round-trip per request for membership checks but requires hook maintenance. **Recommendation:** start with cookie+DB, add the JWT hook in Phase 5 if membership lookups become a hot path.

### 2.2 Tenant column standard

Going forward every new tenant-scoped table MUST have `organization_id uuid NOT NULL REFERENCES organizations(organization_id)`. `farm_id` is only used for farm-specific data (plot-level operations). Cross-farm data lives at the org level.

### 2.3 RLS pattern (canonical)

```sql
alter table public.<table> enable row level security;

create policy "<table>_tenant_isolation"
on public.<table>
as permissive
for all
to authenticated
using (organization_id = any (get_user_organization_ids()))
with check (organization_id = any (get_user_organization_ids()));
```

For child tables that can't carry a denormalized `organization_id` (strongly discouraged, but sometimes unavoidable), use a JOIN-based policy:

```sql
create policy "<child>_tenant_isolation"
on public.<child>
for all to authenticated
using (
  exists (
    select 1 from public.<parent> p
    where p.<parent_pk> = <child>.<parent_fk>
      and p.organization_id = any (get_user_organization_ids())
  )
);
```

### 2.4 Super-admin bypass

Super admins (`user_profiles.is_super_admin = true`) need to support customers. Add an OR clause to tenant policies:

```sql
using (organization_id = any (get_user_organization_ids()) or is_super_admin())
```

Every super-admin access is written to `audit_log` (see Phase 4).

### 2.5 Default org selection rules

- If user belongs to 1 org → auto-select.
- If user belongs to >1 orgs → show org picker at `/select-organization`.
- Cookie survives 365 days; re-validated on every request via membership lookup.
- Switching orgs invalidates all TanStack Query caches (`queryClient.clear()`).

---

## 3. Implementation phases

### Phase 1 — Database hardening (breaks nothing if app code already filters by org)

#### 1.1 Enable RLS + add policies on broken tables

Migration file: `supabase/migrations/<ts>_multi_tenant_rls_hardening.sql`

```sql
-- Enable RLS on tables holding tenant data
alter table public.debt_portfolio                enable row level security;
alter table public.sales_contracts               enable row level security;
alter table public.debt_payment_schedule         enable row level security;
alter table public.chart_of_accounts             enable row level security;
alter table public.cost_centers                  enable row level security;

-- Canonical policy (super-admin bypass included)
create policy "debt_portfolio_tenant_isolation" on public.debt_portfolio
  for all to authenticated
  using  (organization_id = any (get_user_organization_ids()) or is_super_admin())
  with check (organization_id = any (get_user_organization_ids()) or is_super_admin());

-- …repeat for each of the 5 tables
```

Drop or lock down backups & migration artifacts:

```sql
-- Option A: drop (preferred, since we're pre-launch)
drop table if exists public.debt_portfolio_backup_20250730;
drop table if exists public.migration_test;

-- Option B: lock down if they must stay
alter table public.debt_portfolio_backup_20250730 enable row level security;
create policy "locked_backup" on public.debt_portfolio_backup_20250730
  for all to authenticated using (is_super_admin()) with check (is_super_admin());
```

#### 1.2 Add tenant columns + RLS to orphan child tables

Target: `debt_payments`, `plantings`, `lease_payments`, `lease_plot_allocations`, `operation_input_usage`, `inventory_movements*`, `transaction_line_items`, `report_cache`, `report_generation_log`, `scheduled_reports`.

For each table, choose:

- **A (recommended for frequently-queried tables)**: add `organization_id uuid` column, backfill via parent FK, make NOT NULL, add index, write canonical tenant policy.
- **B (for rarely-read tables)**: JOIN-based policy referencing the parent.

```sql
-- Example A: debt_payments
alter table public.debt_payments
  add column organization_id uuid references public.organizations(organization_id);

update public.debt_payments d
set organization_id = p.organization_id
from public.debt_portfolio p
where d.debt_id = p.debt_id;

alter table public.debt_payments
  alter column organization_id set not null;

create index on public.debt_payments (organization_id);
alter table public.debt_payments enable row level security;

create policy "debt_payments_tenant_isolation" on public.debt_payments
  for all to authenticated
  using  (organization_id = any (get_user_organization_ids()) or is_super_admin())
  with check (organization_id = any (get_user_organization_ids()) or is_super_admin());

-- Trigger to auto-stamp from parent on insert
create trigger set_org_on_debt_payments
before insert on public.debt_payments
for each row execute function set_organization_id_from_context();
```

#### 1.3 Fix SECURITY DEFINER views

```sql
-- Recreate offenders as SECURITY INVOKER (default) unless there is a justified exception
alter view public.cost_per_hectare_analysis set (security_invoker = true);
-- …repeat for each view flagged by get_advisors
```

For views that legitimately need to aggregate across tenants (super-admin dashboards), keep `SECURITY DEFINER` but add an `is_super_admin()` check in the view's WHERE clause.

#### 1.4 Reference tables — explicit allow

Tables meant to be globally readable (`commodity_exchanges`, `crop_seasons`, `currency_exchange_rates`, `currency_rate_sources`, `units_of_measure`, `system_config`) should have:

```sql
alter table public.<ref> enable row level security;
create policy "<ref>_read_all" on public.<ref>
  for select to authenticated using (true);
create policy "<ref>_write_super_admin" on public.<ref>
  for all to authenticated using (is_super_admin()) with check (is_super_admin());
```

#### 1.5 Session-context helper (optional, enables SQL-side `current_org_id()`)

```sql
create or replace function public.set_current_org(org_id uuid)
returns void language plpgsql security definer as $$
begin
  if not user_has_organization_access(org_id) then
    raise exception 'not a member of org %', org_id;
  end if;
  perform set_config('app.current_org', org_id::text, true);
end;
$$;

create or replace function public.current_org_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.current_org', true), '')::uuid
$$;
```

This lets RLS policies scope to **one** active org instead of all orgs the user belongs to — important when a user has 10 orgs but is currently working in 1.

#### 1.6 Verification

After each migration, run `mcp__supabase__get_advisors --type security` and confirm zero `policy_exists_rls_disabled` and zero `rls_disabled_in_public` lints.

---

### Phase 2 — App-layer session & server helpers

#### 2.1 Cookie helper

File: `utils/tenant/current-org.ts`

```ts
import { cookies } from 'next/headers'

const COOKIE = 'ac_current_org'
const ONE_YEAR = 60 * 60 * 24 * 365

export async function getCurrentOrgIdFromCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null
}

export async function setCurrentOrgCookie(orgId: string): Promise<void> {
  (await cookies()).set(COOKIE, orgId, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: ONE_YEAR,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearCurrentOrgCookie(): Promise<void> {
  (await cookies()).delete(COOKIE)
}
```

#### 2.2 Server helper that binds Postgres session

File: `utils/tenant/server.ts`

```ts
import { createClient } from '@/utils/supabase/server'
import { getCurrentOrgIdFromCookie } from './current-org'

/** Returns the active org id, verifies membership, and binds it to the Postgres session. */
export async function requireCurrentOrgId(): Promise<string> {
  const orgId = await getCurrentOrgIdFromCookie()
  if (!orgId) throw new Response('No active organization', { status: 428 })
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_current_org', { org_id: orgId })
  if (error) throw new Response(error.message, { status: 403 })
  return orgId
}
```

All route handlers, server components, and server actions that touch tenant data MUST call `requireCurrentOrgId()` at the top.

#### 2.3 Proxy enforcement

Extend `proxy.ts` + `utils/supabase/middleware.ts` to:
- If user is authenticated **and** `ac_current_org` cookie is missing or invalid, rewrite (not redirect) to `/select-organization` for any protected route.
- Skip check for: `/select-organization`, `/invites/*`, `/onboarding/*`.

#### 2.4 Client org-context store (Zustand)

File: `stores/org-store.ts`

```ts
type OrgContext = {
  currentOrgId: string | null
  orgs: OrgMembership[]
  setCurrentOrg: (id: string) => Promise<void>
  refresh: () => Promise<void>
}
```

`setCurrentOrg` calls server action `switchOrganization(id)` which updates the cookie, calls `queryClient.clear()`, and triggers `router.refresh()`.

#### 2.5 Server actions

File: `app/actions/tenant.ts`

- `switchOrganization(orgId: string)` — sets cookie, validates membership.
- `createOrganization(input)` — creates org + adds caller as `owner`.
- `updateOrganization(input)` — requires role ∈ {owner, admin}.
- `deleteOrganization(orgId)` — requires role = owner; soft-delete (sets status = cancelled).
- `leaveOrganization(orgId)` — prevents last-owner-leaves.
- `getMyOrganizations()` — returns the user's memberships + org metadata.

#### 2.6 React Query keys & invalidation

Every tenant-scoped query key MUST include `orgId`:
```ts
['debt-portfolio', orgId, filters]
```
Switching org triggers `queryClient.clear()`. Document this in `CLAUDE.md`.

---

### Phase 3 — New UI surfaces

The existing `components/app-sidebar.tsx` has **no org awareness, no settings, no members, no billing**. We add a full tenancy surface.

#### 3.1 Route inventory (new)

```
app/
  select-organization/page.tsx              # post-login org picker
  onboarding/
    create-organization/page.tsx            # first-run org creation
  invites/
    [token]/page.tsx                        # accept invite landing
  (dashboard)/
    settings/
      organization/page.tsx                 # org profile, branding, localization
      organization/limits/page.tsx          # plan, usage vs. limits, upgrade CTA
      organization/danger-zone/page.tsx     # delete/transfer/leave
      members/page.tsx                      # member list + invite
      members/[memberId]/page.tsx           # member detail & role editor
      invites/page.tsx                      # pending invites
      billing/page.tsx                      # plan, payment method, invoices
      audit-log/page.tsx                    # recent tenant events
      api-keys/page.tsx                     # tenant API tokens (future)
  super-admin/
    organizations/page.tsx                  # global org list
    organizations/[id]/page.tsx             # impersonate / audit one org
    users/page.tsx                          # global user list
    advisors/page.tsx                       # mirror of supabase advisors
```

#### 3.2 Sidebar changes

Edit `components/app-sidebar.tsx`:

- Replace hardcoded `data.user` with real data from `useAuth()` + `useOrgContext()`.
- Add an **OrgSwitcher** component at the top of `SidebarHeader` below the logo: dropdown listing user's orgs, active org checked, "Create organization" item, "Switch to super admin view" if applicable.
- Add `navSecondary` entry for **Configurações** → `/settings/organization` (replace `url: '#'`).
- New group **Administração** visible only to `owner|admin`:
  - Membros
  - Convites
  - Faturamento
  - Limites e uso
  - Log de auditoria
- New group **Super Admin** visible only when `is_super_admin`:
  - Organizações
  - Usuários globais
  - Advisors

#### 3.3 Component inventory (new)

```
components/
  tenant/
    org-switcher.tsx                 # dropdown, current org + list + create
    org-badge.tsx                    # small pill with org name/plan/status
    org-guard.tsx                    # client-side gate: shows fallback if no active org
    trial-banner.tsx                 # global banner on dashboard if trial_ends_at < 14d
    plan-limits-card.tsx             # progress bars: farms/users/hectares
    usage-meter.tsx                  # generic meter used above
    create-org-dialog.tsx            # modal form
    delete-org-dialog.tsx            # type-name-to-confirm modal
    leave-org-dialog.tsx
    transfer-ownership-dialog.tsx
  members/
    member-list.tsx                  # table of org_members
    member-row-actions.tsx           # change role, revoke, resend invite
    invite-member-dialog.tsx         # email + role picker
    invite-list.tsx                  # pending invites
    invite-accept-card.tsx           # shown on /invites/[token]
  audit/
    audit-log-table.tsx
    audit-log-filters.tsx
  admin/                             # super-admin surfaces
    org-admin-table.tsx
    user-admin-table.tsx
    impersonation-banner.tsx
```

All forms use `react-hook-form` + `zod` schemas in `lib/validators/tenant.ts`.

#### 3.4 Page specs (detailed)

**`app/select-organization/page.tsx`** (Server Component)
- Fetches `getMyOrganizations()`.
- If 0 orgs → redirect to `/onboarding/create-organization`.
- If 1 org → set cookie and redirect to `/dashboard`.
- If >1 → render grid of cards: org name, org code, role badge, plan badge, "Enter" button. "Create organization" CTA below.

**`app/onboarding/create-organization/page.tsx`**
- Server Component wrapping a Client form.
- Fields: `organization_name`, `organization_code` (slug), `organization_type`, `tax_id`, `country_code`, `default_currency`, `timezone`, `primary_email`, `primary_phone`.
- Submits server action `createOrganization`.
- On success → set cookie → redirect to `/dashboard` with a toast "Organização criada".

**`app/(dashboard)/settings/organization/page.tsx`**
- Tabs: Geral | Localização | Endereço | Marca | Preferências.
- Role gate: `owner|admin|manager` read; `owner|admin` write.
- Editable: org name, tax_id, registration, address, website, billing email, timezone, date_format, number_format, default_currency, logo upload (Supabase Storage bucket `org-branding/<org_id>/logo.png`).

**`app/(dashboard)/settings/organization/limits/page.tsx`**
- Read-only page showing `PlanLimitsCard` with progress bars:
  - Fazendas: `count(farms) / max_farms`
  - Usuários: `count(organization_members) / max_users`
  - Hectares: `sum(farms.total_hectares) / max_hectares`
- Shows `subscription_plan` badge, `trial_ends_at` countdown, "Upgrade" CTA linking to `/settings/billing`.
- Data source: one SQL RPC `org_usage_summary(org_id)` returning the three counts + org plan fields.

**`app/(dashboard)/settings/members/page.tsx`**
- `MemberList` table columns: Avatar | Name | Email | Role | Department | Status (is_active) | Last login | Actions.
- Empty state with "Convidar primeiro membro" CTA.
- Header button: "Convidar membro" → `InviteMemberDialog`.
- Filters: role, status, search by name/email.

**`InviteMemberDialog`**
- Fields: `email`, `role` (enum select), `department`, `position_title`, optional `permissions` JSON override (advanced toggle).
- Submits server action `inviteMember({ email, role, ... })` which:
  1. Checks caller is `owner|admin`.
  2. Checks `count(organization_members) < max_users`.
  3. Inserts a row in new table `organization_invites` (see 3.5).
  4. Sends email via Supabase Auth `signInWithOtp` with `emailRedirectTo = ${siteUrl}/invites/${token}`.

**`app/invites/[token]/page.tsx`**
- Server Component.
- Fetches invite by token, 404 if expired/consumed.
- If invite email matches logged-in user → show `InviteAcceptCard` with org details + role preview + "Aceitar" / "Recusar" buttons.
- If not logged in → redirect to `/login?next=/invites/<token>`.
- If logged-in email differs from invite email → show mismatch error with "Sign out" action.
- Accepting calls server action `acceptInvite(token)` → creates `organization_members` row → sets cookie → redirect `/dashboard`.

**`app/(dashboard)/settings/billing/page.tsx`**
- Stubbed for now; shows plan + mock invoices.
- Integration point for Stripe left as future ticket.

**`app/(dashboard)/settings/audit-log/page.tsx`**
- Table of `audit_log` rows filtered by `organization_id`.
- Filters: actor, action type, date range.
- Columns: Timestamp | Actor | Action | Target | Diff (JSON preview).

**`app/super-admin/organizations/page.tsx`**
- Guarded by `is_super_admin()` server-side.
- Full org list with: name, plan, status, member count, created_at, "Impersonate" action.
- Impersonation sets cookie + writes `audit_log` entry with `action = 'super_admin_impersonate'`.
- Persistent `ImpersonationBanner` component shown at top of every dashboard page when impersonating.

#### 3.5 New database objects for the UI

Migration `<ts>_tenant_ui_support.sql`:

```sql
-- Invites
create table public.organization_invites (
  invite_id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(organization_id) on delete cascade,
  email citext not null,
  role organization_role_enum not null,
  permissions jsonb,
  token text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);
create index on organization_invites (organization_id);
create index on organization_invites (email);
alter table organization_invites enable row level security;
create policy "invites_tenant_isolation" on organization_invites
  for all to authenticated
  using  (organization_id = any (get_user_organization_ids()) or email = auth.email())
  with check (organization_id = any (get_user_organization_ids()));

-- Audit log
create table public.audit_log (
  audit_id bigserial primary key,
  organization_id uuid references organizations(organization_id) on delete cascade,
  actor_id uuid references auth.users(id),
  actor_is_super_admin boolean not null default false,
  action text not null,
  target_table text,
  target_id text,
  diff jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz default now()
);
create index on audit_log (organization_id, created_at desc);
alter table audit_log enable row level security;
create policy "audit_read_org" on audit_log
  for select to authenticated
  using (organization_id = any (get_user_organization_ids()) or is_super_admin());
create policy "audit_insert_self" on audit_log
  for insert to authenticated
  with check (actor_id = auth.uid());

-- Usage summary RPC
create or replace function public.org_usage_summary(p_org uuid)
returns table(
  farms_used int, farms_limit int,
  users_used int, users_limit int,
  hectares_used numeric, hectares_limit numeric,
  plan text, status organization_status_enum, trial_ends_at timestamptz
)
language sql stable security invoker as $$
  select
    (select count(*) from farms where organization_id = p_org)::int,
    o.max_farms,
    (select count(*) from organization_members where organization_id = p_org)::int,
    o.max_users,
    coalesce((select sum(total_hectares) from farms where organization_id = p_org), 0),
    o.max_hectares,
    o.subscription_plan,
    o.status,
    o.trial_ends_at
  from organizations o
  where o.organization_id = p_org
    and user_has_organization_access(p_org);
$$;
```

---

### Phase 4 — Audit & observability

- Replace ad-hoc write logic with a `withAudit(action, target, fn)` wrapper in `lib/audit.ts` used by every mutating server action.
- Record: actor, org, action, target, IP, UA, diff (old vs. new for updates).
- Add `AuditLogTable` with pagination + server-side filter RPC `audit_log_search(p_org, p_from, p_to, p_action, p_actor)`.
- Super-admin actions always log even if they happen outside a single org (`organization_id` nullable on `audit_log`).

---

### Phase 5 — Optional JWT claim hook (performance)

Only do this once Phase 1–4 ship cleanly.

Install custom access token hook:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer as $$
declare
  claims jsonb := event->'claims';
  org_ids uuid[];
  super_admin boolean;
begin
  select array_agg(organization_id) into org_ids
  from organization_members where user_id = (event->>'user_id')::uuid;

  select coalesce(is_super_admin, false) into super_admin
  from user_profiles where user_id = (event->>'user_id')::uuid;

  claims := jsonb_set(claims, '{app_metadata, organization_ids}',
                      to_jsonb(coalesce(org_ids, '{}'::uuid[])));
  claims := jsonb_set(claims, '{app_metadata, is_super_admin}',
                      to_jsonb(coalesce(super_admin, false)));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
```

Enable in Supabase dashboard: **Authentication → Hooks → Custom Access Token**.

Then refactor `get_user_organization_ids()` to prefer the JWT claim:
```sql
create or replace function public.get_user_organization_ids()
returns uuid[] language sql stable as $$
  select coalesce(
    (select array(select jsonb_array_elements_text(auth.jwt()->'app_metadata'->'organization_ids')::uuid)),
    array(select organization_id from organization_members where user_id = auth.uid())
  );
$$;
```

Drop to 0 round-trips on most policies.

---

## 4. Detailed file-change checklist

### Database migrations (in order)
- `<ts1>_multi_tenant_rls_hardening.sql` — Phase 1.1–1.3
- `<ts2>_orphan_tables_tenancy.sql` — Phase 1.2 column adds + policies
- `<ts3>_reference_tables_readable.sql` — Phase 1.4
- `<ts4>_session_context_helpers.sql` — Phase 1.5
- `<ts5>_tenant_ui_support.sql` — invites + audit_log + org_usage_summary
- `<ts6>_custom_access_token_hook.sql` — Phase 5 (optional)

### New source files
- `utils/tenant/current-org.ts`
- `utils/tenant/server.ts`
- `stores/org-store.ts`
- `app/actions/tenant.ts`
- `app/select-organization/page.tsx`
- `app/onboarding/create-organization/page.tsx`
- `app/invites/[token]/page.tsx`
- `app/(dashboard)/settings/organization/page.tsx`
- `app/(dashboard)/settings/organization/limits/page.tsx`
- `app/(dashboard)/settings/organization/danger-zone/page.tsx`
- `app/(dashboard)/settings/members/page.tsx`
- `app/(dashboard)/settings/members/[memberId]/page.tsx`
- `app/(dashboard)/settings/invites/page.tsx`
- `app/(dashboard)/settings/billing/page.tsx`
- `app/(dashboard)/settings/audit-log/page.tsx`
- `app/super-admin/**/page.tsx`
- `components/tenant/*` (9 files)
- `components/members/*` (4 files)
- `components/audit/*` (2 files)
- `components/admin/*` (3 files)
- `lib/validators/tenant.ts`
- `lib/audit.ts`
- `hooks/use-current-org.ts`
- `hooks/use-org-role.ts`
- `hooks/use-org-usage.ts`

### Modified files
- `proxy.ts` — add org-selection gate
- `utils/supabase/middleware.ts` — bind session config from cookie (optional)
- `components/app-sidebar.tsx` — OrgSwitcher, dynamic user data, admin nav groups, super-admin group
- `components/nav-user.tsx` — wire real user data + link "Conta" → `/settings/profile`, "Faturamento" → `/settings/billing`
- `components/providers.tsx` — wrap with `OrgContextProvider`
- `CLAUDE.md` — add tenancy conventions section

---

## 5. Testing plan

1. **RLS regression suite**
   - Create two seed orgs A and B with one user each.
   - For each tenant table, assert: user-A SELECT returns only A's rows; user-A INSERT into B fails; user-A UPDATE of B's row returns 0 rows.
   - Run via Supabase SQL test via `pgtap` or a simple integration test file in `__tests__/rls/`.

2. **Advisor baseline**
   - After each migration, `mcp__supabase__get_advisors --type security` must return 0 ERROR-level lints.

3. **UI smoke tests**
   - Create org → invite member → member accepts → member sees limited nav → promote to admin → admin invites → owner deletes org.
   - Org switch must clear React Query cache (verify by watching network tab — no stale data).

4. **Super-admin flow**
   - Enable flag on one user → login → `/super-admin/organizations` visible → impersonate → banner shows → audit log records the event.

5. **Load check (Phase 5 only)**
   - Before JWT hook: measure P95 of any page that runs 5+ RLS-protected queries.
   - After: confirm drop (expected 15–30%).

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Enabling RLS on tables with existing orphan rows (no `organization_id`) blocks all reads | Backfill FIRST, verify `WHERE organization_id IS NULL` returns 0, THEN add NOT NULL and RLS |
| `SECURITY DEFINER` views we flip to `SECURITY INVOKER` may expose intended cross-tenant aggregations | Review each view; add explicit `is_super_admin()` check if cross-tenant is intentional |
| Cookie-based org context is spoofable if not httpOnly | Always set `httpOnly: true`; re-verify membership every request |
| User belongs to 10 orgs, RLS `organization_id = any(...)` becomes slow | Add composite index `(organization_id, created_at)` on hot tables; move to per-org session via `current_org_id()` in policies |
| Invite email enumeration | Rate-limit the invite endpoint; log attempts |
| Super-admin impersonation abuse | Every super-admin action is audit-logged with `actor_is_super_admin = true`; display prominent banner; require re-auth before entering super-admin mode |

---

## 7. Rollout order

1. **Week 1** — Phase 1 (DB hardening). Ship migration per table group; verify advisors clean.
2. **Week 2** — Phase 2 (app session + server helpers). Ship `requireCurrentOrgId`, `switchOrganization` action, proxy gate, `/select-organization` page.
3. **Week 3–4** — Phase 3 (UI). Ship org settings, members, invites, limits pages.
4. **Week 5** — Phase 4 (audit). Wrap all mutating actions.
5. **Week 6** — Phase 5 (JWT hook) if perf warrants.

Gate launch on: advisors clean + RLS test suite green + member invite E2E green.
