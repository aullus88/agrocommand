# RBAC Implementation Plan

**Status:** Draft
**Target stack:** Next.js 16 (App Router) · React 19 · Supabase (Postgres + Auth + Hooks) · TanStack Query · shadcn/ui
**Scope:** Transform the existing role+JSON-permission skeleton into a fully-enforced RBAC system with server-side guards, client-side gates, DB-level authorization via JWT custom claims, and complete management UI.

**Depends on:** `MULTI_TENANT_IMPLEMENTATION_PLAN.md` (tenant isolation + current-org context must exist for per-org roles to make sense).

---

## 1. Context & current state

The database already provides a workable RBAC foundation:

- **Role enum** (`organization_role_enum`): `owner`, `admin`, `manager`, `operator`, `viewer` — stored on `organization_members.role` (NOT NULL).
- **Permission overrides** (`organization_members.permissions` JSONB) per-resource CRUD flags:
  ```json
  {
    "farms":    { "read":true, "create":true, "update":true, "delete":false },
    "members":  { "invite":false, "manage":false },
    "reports":  { "read":true, "export":true },
    "finances": { "read":true, "create":true, "update":true, "delete":false },
    "settings": { "read":false, "update":false }
  }
  ```
- **Super-admin flag** on `user_profiles.is_super_admin`.
- **Helper functions** already defined: `get_user_organization_role(org_id)`, `user_has_organization_access(org_id)`, `is_super_admin()`.

**What's missing:**

1. **No role hierarchy helper** — policies check membership but rarely role; there's no `has_role_at_least(org, role)` function.
2. **Permission JSONB is unused** — all existing RLS policies check membership only, so the JSONB permission flags are decorative.
3. **No JWT claims for role/permissions** — every policy does a subquery against `organization_members`.
4. **No server-side authorization layer** — server actions don't check roles; any member can call `updateOrganization`.
5. **No client-side gates** — sidebar shows everything to everyone; buttons are never hidden by role.
6. **No UI** to view/change a member's role, customize permissions, define custom roles, or see an audit trail of role changes.
7. **No permission matrix concept** — roles-to-permissions mapping lives only in the defaults of the `permissions` JSONB column.

This plan fixes those gaps.

---

## 2. Design decisions

### 2.1 Role vs. permission: canonical model

Use a **role-primary, permission-override** model:

1. Each `organization_role_enum` maps to a default set of permissions (stored in `role_permissions` table).
2. A membership *may* override specific permissions via `organization_members.permissions` JSONB.
3. Authorization resolves as: `effective = role_defaults OVERLAID WITH member_overrides`.
4. Policies check `authorize(org_id, 'finances.update')`.

This gives simple UX ("pick a role") with escape hatches (per-member overrides) without creating a full custom-role management burden upfront.

### 2.2 Role hierarchy

Strict ranking used by UI and policies:
```
owner (100) > admin (80) > manager (60) > operator (40) > viewer (20)
```

SQL helper `has_role_at_least(org_id, 'manager')` returns true if the user's role rank ≥ target rank.

### 2.3 Permission taxonomy

Flat `resource.action` namespace, enum-backed so typos become compile errors:

```
organization.read          organization.update          organization.delete
members.read               members.invite               members.update_role       members.remove
farms.read                 farms.create                 farms.update              farms.delete
field_plots.read           field_plots.create           field_plots.update        field_plots.delete
field_operations.read      field_operations.create      field_operations.update   field_operations.delete
finances.read              finances.create              finances.update           finances.delete
debt.read                  debt.create                  debt.update               debt.delete
contracts.read             contracts.create             contracts.update          contracts.delete
inventory.read             inventory.create             inventory.update          inventory.delete
reports.read               reports.export
billing.read               billing.update
audit.read
settings.read              settings.update
integrations.manage
```

Stored as Postgres enum `app_permission`.

### 2.4 Role → permission default matrix

| Permission | owner | admin | manager | operator | viewer |
|---|:-:|:-:|:-:|:-:|:-:|
| organization.* | ✅ | update | ❌ | ❌ | ❌ |
| members.read | ✅ | ✅ | ✅ | ✅ | ❌ |
| members.invite / update_role / remove | ✅ | ✅ | ❌ | ❌ | ❌ |
| farms.* | ✅ | ✅ | read+update | read | read |
| field_plots.* | ✅ | ✅ | ✅ | read+update | read |
| field_operations.* | ✅ | ✅ | ✅ | ✅ | read |
| finances.read | ✅ | ✅ | ✅ | ❌ | ✅ (configurable) |
| finances.create/update/delete | ✅ | ✅ | create+update | ❌ | ❌ |
| debt.* | ✅ | ✅ | read+update | ❌ | read |
| contracts.* | ✅ | ✅ | read+create+update | ❌ | read |
| inventory.* | ✅ | ✅ | ✅ | ✅ | read |
| reports.read / export | ✅ | ✅ | ✅ | ✅ | read |
| billing.* | ✅ | read | ❌ | ❌ | ❌ |
| audit.read | ✅ | ✅ | ❌ | ❌ | ❌ |
| settings.* | ✅ | ✅ | read | ❌ | ❌ |
| integrations.manage | ✅ | ✅ | ❌ | ❌ | ❌ |

Materialized in `role_permissions` (role, permission) table.

### 2.5 Where authorization runs

1. **Database (last line of defense)** — RLS policies call `authorize('permission')` which reads the role from JWT claim `user_role_for_org` (populated by custom access token hook). If bypassed by app bug, DB denies.
2. **Server Actions & Route Handlers** — `requirePermission('permission')` helper throws 403 if the caller lacks it. Non-negotiable for any mutation.
3. **Server Components** — `can('permission')` used to render/omit sections; not a security boundary but UX polish.
4. **Client Components** — `<Can permission="..."><Button/></Can>` + `useCan()` hook; purely UX, never trust.

### 2.6 Super-admin bypass

Super-admins (`is_super_admin = true`) bypass role checks but are **logged** on every super-admin-gated action. Super-admin is NOT a role — it's a cross-org flag on the user profile.

### 2.7 Custom roles (out of scope, v2)

Phase 1 ships **5 built-in roles**. Custom role creation is a v2 feature that would add a `custom_roles` table. Design notes included in §7 but not implemented.

---

## 3. Implementation phases

### Phase 1 — Database: permissions taxonomy + role matrix

Migration `<ts>_rbac_permissions_schema.sql`:

```sql
-- Permission enum (stable alphabetical order)
create type public.app_permission as enum (
  'audit.read',
  'billing.read','billing.update',
  'contracts.create','contracts.delete','contracts.read','contracts.update',
  'debt.create','debt.delete','debt.read','debt.update',
  'farms.create','farms.delete','farms.read','farms.update',
  'field_operations.create','field_operations.delete','field_operations.read','field_operations.update',
  'field_plots.create','field_plots.delete','field_plots.read','field_plots.update',
  'finances.create','finances.delete','finances.read','finances.update',
  'integrations.manage',
  'inventory.create','inventory.delete','inventory.read','inventory.update',
  'members.invite','members.read','members.remove','members.update_role',
  'organization.delete','organization.read','organization.update',
  'reports.export','reports.read',
  'settings.read','settings.update'
);

-- Role <-> permission mapping
create table public.role_permissions (
  role organization_role_enum not null,
  permission app_permission not null,
  primary key (role, permission)
);

-- Seed (example subset — full matrix in §2.4)
insert into role_permissions (role, permission) values
  -- owner: all
  ('owner','organization.delete'), ('owner','organization.update'), ('owner','organization.read'),
  ('owner','members.invite'), ('owner','members.update_role'), ('owner','members.remove'), ('owner','members.read'),
  ('owner','billing.read'), ('owner','billing.update'),
  -- admin: everything except billing.update + organization.delete
  ('admin','organization.update'), ('admin','organization.read'),
  ('admin','members.invite'), ('admin','members.update_role'), ('admin','members.remove'), ('admin','members.read'),
  ('admin','billing.read'),
  -- … (seed the full matrix from §2.4)
  ;

alter table role_permissions enable row level security;
create policy "role_permissions_read_all" on role_permissions
  for select to authenticated using (true);
-- Writable only by superuser/migrations; no INSERT/UPDATE/DELETE policy.
```

### Phase 2 — Database: authorization helpers

Migration `<ts>_rbac_helpers.sql`:

```sql
-- Role rank
create or replace function public.role_rank(r organization_role_enum)
returns int language sql immutable as $$
  select case r
    when 'owner'    then 100
    when 'admin'    then  80
    when 'manager'  then  60
    when 'operator' then  40
    when 'viewer'   then  20
  end;
$$;

-- has_role_at_least
create or replace function public.has_role_at_least(p_org uuid, p_role organization_role_enum)
returns boolean language sql stable security invoker as $$
  select coalesce(role_rank(get_user_organization_role(p_org)) >= role_rank(p_role), false);
$$;

-- authorize(org, permission) — uses JWT claim if present, else DB lookup
create or replace function public.authorize(p_org uuid, p_permission app_permission)
returns boolean language plpgsql stable security invoker as $$
declare
  v_role organization_role_enum;
  v_override jsonb;
  v_granted boolean;
begin
  -- Super-admin short-circuit
  if is_super_admin() then return true; end if;

  -- Prefer JWT claim (set by custom_access_token_hook)
  v_role := nullif(
    (auth.jwt()->'app_metadata'->'roles'->>p_org::text),
    ''
  )::organization_role_enum;

  if v_role is null then
    -- Fallback to DB lookup
    select role, permissions into v_role, v_override
    from organization_members
    where organization_id = p_org and user_id = auth.uid();
  else
    select permissions into v_override
    from organization_members
    where organization_id = p_org and user_id = auth.uid();
  end if;

  if v_role is null then return false; end if;

  -- Member override wins if present
  v_granted := (v_override #> string_to_array(replace(p_permission::text,'.',','), ','))::boolean;
  if v_granted is not null then return v_granted; end if;

  -- Otherwise role default
  return exists (
    select 1 from role_permissions
    where role = v_role and permission = p_permission
  );
end;
$$;

-- Convenience wrapper scoped to the current-org session variable (set by set_current_org)
create or replace function public.can(p_permission app_permission)
returns boolean language sql stable as $$
  select authorize(current_org_id(), p_permission);
$$;
```

### Phase 3 — Database: tighter RLS policies using `authorize`

Upgrade the canonical tenant policies to also check permissions for write ops:

```sql
-- Example: debt_portfolio
drop policy if exists "debt_portfolio_tenant_isolation" on debt_portfolio;

create policy "debt_portfolio_read" on debt_portfolio for select to authenticated
  using (organization_id = any (get_user_organization_ids()) and authorize(organization_id,'debt.read'));

create policy "debt_portfolio_insert" on debt_portfolio for insert to authenticated
  with check (organization_id = current_org_id() and authorize(organization_id,'debt.create'));

create policy "debt_portfolio_update" on debt_portfolio for update to authenticated
  using (organization_id = any (get_user_organization_ids()) and authorize(organization_id,'debt.update'))
  with check (organization_id = any (get_user_organization_ids()) and authorize(organization_id,'debt.update'));

create policy "debt_portfolio_delete" on debt_portfolio for delete to authenticated
  using (organization_id = any (get_user_organization_ids()) and authorize(organization_id,'debt.delete'));
```

Apply the same split (read/insert/update/delete per permission) to every tenant table. A codegen script or a SQL function that builds these DDL statements dynamically per table can save typing.

### Phase 4 — Custom access token hook (JWT claims)

Migration `<ts>_access_token_rbac_hook.sql`:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  claims jsonb := event->'claims';
  v_roles jsonb;
  v_super boolean;
begin
  -- Build a map { "<org_id>": "<role>" } for all orgs the user belongs to
  select coalesce(jsonb_object_agg(organization_id::text, role::text), '{}'::jsonb)
    into v_roles
  from public.organization_members
  where user_id = (event->>'user_id')::uuid;

  select coalesce(is_super_admin, false) into v_super
  from public.user_profiles where user_id = (event->>'user_id')::uuid;

  claims := jsonb_set(claims, '{app_metadata, roles}', v_roles);
  claims := jsonb_set(claims, '{app_metadata, is_super_admin}', to_jsonb(coalesce(v_super, false)));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- Auth admin needs read access to sourced tables
grant select on public.organization_members to supabase_auth_admin;
grant select on public.user_profiles to supabase_auth_admin;
```

Enable in Supabase dashboard: **Authentication → Hooks → Custom Access Token → select `public.custom_access_token_hook`**.

**Claim-refresh strategy:** JWT is re-minted on refresh (~1h by default). When a member's role changes, call `supabase.auth.refreshSession()` on the target user's next request. For immediate effect, we also keep the DB fallback path in `authorize()` so the first request with an old JWT won't privilege-escalate — it will still hit `organization_members`.

### Phase 5 — Server-side authorization layer

#### 5.1 Permission type

File: `lib/authz/permissions.ts`

```ts
export const PERMISSIONS = [
  'audit.read',
  'billing.read','billing.update',
  'contracts.create','contracts.delete','contracts.read','contracts.update',
  // …keep in sync with SQL enum
] as const
export type Permission = typeof PERMISSIONS[number]

export const ROLES = ['owner','admin','manager','operator','viewer'] as const
export type Role = typeof ROLES[number]
export const ROLE_RANK: Record<Role, number> =
  { owner:100, admin:80, manager:60, operator:40, viewer:20 }
```

Generate this file automatically from the DB enum using `supabase gen types` + a small transformer, so the TS list can never drift from Postgres.

#### 5.2 Server helpers

File: `lib/authz/server.ts`

```ts
import { requireCurrentOrgId } from '@/utils/tenant/server'
import { createClient } from '@/utils/supabase/server'
import type { Permission, Role } from './permissions'

export async function getMyRole(orgId?: string): Promise<Role | null> {
  const org = orgId ?? await requireCurrentOrgId()
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_user_organization_role', { p_org: org })
  return (data as Role | null) ?? null
}

export async function can(permission: Permission, orgId?: string): Promise<boolean> {
  const org = orgId ?? await requireCurrentOrgId()
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('authorize', {
    p_org: org, p_permission: permission,
  })
  return !error && data === true
}

export async function requirePermission(permission: Permission): Promise<void> {
  if (!(await can(permission))) {
    throw new Response('Forbidden', { status: 403 })
  }
}

export async function requireRoleAtLeast(role: Role): Promise<void> {
  const org = await requireCurrentOrgId()
  const supabase = await createClient()
  const { data } = await supabase.rpc('has_role_at_least', { p_org: org, p_role: role })
  if (data !== true) throw new Response('Forbidden', { status: 403 })
}
```

Every mutating server action MUST start with `await requirePermission('x.y')`. Document in `CLAUDE.md`.

#### 5.3 Route Handler wrapper

File: `lib/authz/route.ts`

```ts
import { NextResponse } from 'next/server'
import { can } from './server'
import type { Permission } from './permissions'

export function withAuthz<T extends (req: Request) => Promise<Response>>(
  permission: Permission, handler: T
) {
  return async (req: Request) => {
    if (!(await can(permission))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return handler(req)
  }
}
```

### Phase 6 — Client-side gates

#### 6.1 Hook + component

File: `hooks/use-can.ts`

```ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { useCurrentOrg } from './use-current-org'
import { createClient } from '@/utils/supabase/client'
import type { Permission } from '@/lib/authz/permissions'

export function useCan(permission: Permission) {
  const { orgId } = useCurrentOrg()
  const supabase = createClient()
  return useQuery({
    queryKey: ['can', orgId, permission],
    queryFn: async () => {
      if (!orgId) return false
      const { data } = await supabase.rpc('authorize',
        { p_org: orgId, p_permission: permission })
      return data === true
    },
    staleTime: 60_000,
  })
}
```

File: `components/authz/can.tsx`

```tsx
'use client'
import { useCan } from '@/hooks/use-can'
import type { Permission } from '@/lib/authz/permissions'

export function Can({
  permission, fallback = null, children,
}: { permission: Permission; fallback?: React.ReactNode; children: React.ReactNode }) {
  const { data, isLoading } = useCan(permission)
  if (isLoading) return null
  return data ? <>{children}</> : <>{fallback}</>
}
```

#### 6.2 Role hook

File: `hooks/use-org-role.ts` — reads role from JWT (parsed client-side from `supabase.auth.getSession()`), falls back to RPC. Returns `{ role, rank, isAtLeast(target) }`.

### Phase 7 — UI surfaces (new & modified)

#### 7.1 Sidebar reshape (`components/app-sidebar.tsx`)

- Wrap each nav group in `<Can permission="...">` so unauthorized sections disappear. Mapping:
  - "Análise Financeira" → `finances.read`
  - "Comercialização e Hedge" → `contracts.read`
  - "Gestão de Riscos" → `reports.read` (lax) or a dedicated `risk.read`
  - "ESG e Sustentabilidade" → `reports.read`
  - "Centro de Comando (War Room)" → `audit.read`
  - Settings group → `settings.read`
- Sub-items with create/delete buttons (e.g. `/financial/debt-management/admin`) gated by `debt.create` or `settings.update`.

#### 7.2 New pages

```
app/(dashboard)/settings/
  roles/page.tsx                       # role → permission matrix (read-only view)
  roles/[role]/page.tsx                # permissions checkbox grid for that role (owner-only)
  members/[memberId]/page.tsx          # existing page from tenant plan — add role editor + permission overrides tab
  permissions/page.tsx                 # full flat list of permissions with search (developer reference)
```

#### 7.3 Components

```
components/authz/
  can.tsx                              # <Can permission="...">
  role-badge.tsx                       # colored pill: owner|admin|manager|operator|viewer
  role-select.tsx                      # select input, disables roles > caller's
  permission-matrix-table.tsx          # role × permission grid with checkboxes
  permission-diff.tsx                  # shows overrides applied on top of role defaults
  change-role-dialog.tsx               # with "last owner" guard
  transfer-ownership-dialog.tsx
  no-access-empty-state.tsx            # shown by Can fallback on full pages
```

#### 7.4 Detailed page specs

**`/settings/roles/page.tsx`** (Server Component)
- Table: rows = permissions (grouped by resource), columns = roles (owner…viewer), cells = ✓/✗.
- Read-only in Phase 1 (seeded matrix is immutable); owner can edit in Phase 2 if custom roles land.
- Data from `role_permissions` table.

**`/settings/roles/[role]/page.tsx`** (owner-only)
- Deep link from the matrix.
- Edit checkbox grid, submit rewrites rows in `role_permissions` for that role scoped to the caller's organization via a future `org_role_permissions` table (v2 — not in Phase 1).

**`/settings/members/[memberId]/page.tsx`**
- Tab "Perfil" — display name, department, position, last login.
- Tab "Papel" — `role-select` + "Salvar" button. Uses `change-role-dialog` that shows:
  - Current role vs. new role.
  - "You cannot change the last owner" guard.
  - "You cannot assign a role higher than your own" guard.
  - On submit: `updateMemberRole` server action + audit-log entry.
- Tab "Permissões" — `permission-matrix-table` starting from role defaults; overrides can be toggled on/off. Shows `permission-diff` above.
- Tab "Histórico" — audit log filtered by `target_table = 'organization_members' AND target_id = member_id`.
- "Remover membro" button (owners/admins only, not targeting the last owner) → `remove-member` action.
- "Transferir propriedade" button — only visible to owner when viewing another owner/admin.

**`/settings/permissions/page.tsx`**
- Developer reference: search box + flat list of all `app_permission` enum values with short descriptions (stored in a constant `lib/authz/permission-descriptions.ts`).

#### 7.5 Every existing page that mutates needs a gate

Audit each existing route under `app/(dashboard)/**` and add:
- Page-level `requirePermission('x.read')` in its server component layout or page.
- `<Can>` wrappers around action buttons (edit/delete/export).

Tracked in a follow-up ticket — initial rollout just needs the framework in place.

### Phase 8 — Audit trail for role/permission changes

Add to `lib/audit.ts`:

```ts
// already planned in MT plan; extend with these actions:
'member.role_changed'
'member.permissions_changed'
'member.removed'
'member.invited'
'member.invite_revoked'
'owner.transferred'
'super_admin.enabled'
'super_admin.disabled'
```

For each action, `diff` stores `{ before: {...}, after: {...} }`. `AuditLogTable` (from tenant plan) already renders these.

---

## 4. File-change checklist

### New DB migrations
- `<ts1>_rbac_permissions_schema.sql` — enum + `role_permissions` + seed
- `<ts2>_rbac_helpers.sql` — `role_rank`, `has_role_at_least`, `authorize`, `can`
- `<ts3>_rbac_policies_upgrade.sql` — split tenant RLS into read/insert/update/delete with permission checks
- `<ts4>_access_token_rbac_hook.sql` — custom access token hook
- `<ts5>_rbac_audit_actions.sql` — (if any server-side audit triggers)

### New source files
- `lib/authz/permissions.ts` — Permission type, generated from DB
- `lib/authz/server.ts` — `can`, `requirePermission`, `requireRoleAtLeast`, `getMyRole`
- `lib/authz/route.ts` — `withAuthz` wrapper
- `lib/authz/permission-descriptions.ts` — human-readable labels per permission
- `hooks/use-can.ts`
- `hooks/use-org-role.ts`
- `components/authz/can.tsx`
- `components/authz/role-badge.tsx`
- `components/authz/role-select.tsx`
- `components/authz/permission-matrix-table.tsx`
- `components/authz/permission-diff.tsx`
- `components/authz/change-role-dialog.tsx`
- `components/authz/transfer-ownership-dialog.tsx`
- `components/authz/no-access-empty-state.tsx`
- `app/(dashboard)/settings/roles/page.tsx`
- `app/(dashboard)/settings/roles/[role]/page.tsx` (v2 stub)
- `app/(dashboard)/settings/permissions/page.tsx`
- `app/actions/rbac.ts` — `updateMemberRole`, `updateMemberPermissions`, `removeMember`, `transferOwnership`

### Modified files
- `components/app-sidebar.tsx` — wrap nav items in `<Can>`
- `app/(dashboard)/settings/members/[memberId]/page.tsx` — add Role / Permissions / History tabs
- `app/actions/tenant.ts` — `updateOrganization` / `deleteOrganization` now call `requirePermission('organization.update'|'organization.delete')`
- Every existing mutating server action (debt, contracts, farms, …) — prepend `requirePermission(...)`
- `CLAUDE.md` — RBAC conventions section

---

## 5. Testing plan

### 5.1 DB unit tests (pgtap)

- `role_rank` returns expected numbers.
- `has_role_at_least('owner')` true for owner, false for admin.
- `authorize(org, 'debt.delete')`:
  - true for owner/admin, false for manager/operator/viewer.
  - Respects member override (JSONB) both adding and removing permissions.
  - Super-admin returns true regardless.

### 5.2 RLS regression per role

Matrix test: for each role × each tenant table × each CRUD op → assert expected success/fail using the seeded test users.

### 5.3 Server action tests

For each mutating action, call with an `operator` session and assert 403.

### 5.4 E2E (Playwright)

- Viewer logs in → only dashboard routes with `reports.read` render; "Exportar" button hidden.
- Operator promotes themselves via UI → denied (control disabled + server rejects).
- Admin invites a viewer → viewer accepts → can view farms but cannot click "Nova Fazenda".
- Owner demotes the only other owner to admin → allowed; owner cannot demote themselves if last owner.
- Owner transfers ownership → old owner becomes admin, target becomes owner.

### 5.5 JWT hook verification

- `supabase.auth.getSession()` in browser dev tools shows `app_metadata.roles` map.
- Change a member's role via UI → `refreshSession()` → new claim reflects.

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| JWT claim can drift from DB for up to 1h on role change | `authorize()` falls back to DB lookup when JWT is missing; force `refreshSession()` on role change; keep policies calling `authorize()` not reading claims directly |
| Permission enum drift between TS and SQL | Generate TS enum from DB types (`supabase gen types`) + CI check |
| Custom roles feature creep | Explicitly deferred to v2 with `org_role_permissions` table design sketch |
| Last-owner lockout (self-demote, leave, or delete) | DB trigger on `organization_members` blocks transitions that would leave zero owners |
| Accidental 403 storms in UI | `<Can>` defaults to `fallback={null}` not an error; `useCan` query caches 60s |
| Super-admin footgun | Every call via `requirePermission` is audit-logged with `actor_is_super_admin = true` flag; dedicated super-admin surface has prominent banner |
| Permission grid too wide to edit manually | Ship the matrix view in Phase 7; per-org custom roles are v2 |

**Last-owner trigger:**

```sql
create or replace function public.prevent_last_owner_loss()
returns trigger language plpgsql as $$
declare
  remaining_owners int;
begin
  if (tg_op = 'DELETE' and old.role = 'owner')
     or (tg_op = 'UPDATE' and old.role = 'owner' and new.role <> 'owner') then
    select count(*) into remaining_owners
    from organization_members
    where organization_id = old.organization_id
      and role = 'owner'
      and member_id <> old.member_id;
    if remaining_owners = 0 then
      raise exception 'cannot leave organization % without an owner', old.organization_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_prevent_last_owner_loss
before update or delete on organization_members
for each row execute function prevent_last_owner_loss();
```

---

## 7. v2 preview — Custom org roles

Not implemented now; design sketch for future reference:

- New tables: `custom_roles (role_id, organization_id, name, description, rank)` and `custom_role_permissions (role_id, permission)`.
- `organization_members.role` stays an enum but a nullable `custom_role_id` is added; if both set, the custom role wins.
- `authorize()` extends to check custom_role_permissions before role_permissions.
- Owner-only UI at `/settings/roles` to CRUD custom roles.

---

## 8. Rollout order

1. **Week 1** — Phase 1 + 2 DB (permissions enum, role_permissions seed, helpers). Ship with no policy changes so nothing regresses.
2. **Week 2** — Phase 3 DB (policy split with `authorize`) behind a feature flag (`rbac_policies_enforced` boolean in `system_config`). Both old and new policies coexist via OR until the new path is validated.
3. **Week 3** — Phase 4 hook + Phase 5 server helpers. Add `requirePermission` to every existing server action.
4. **Week 4** — Phase 6 client hooks + Phase 7 UI (members role editor, sidebar gates, role matrix).
5. **Week 5** — Phase 8 audit coverage + test sweep. Flip the enforcement flag to `true` in staging, soak for a week, then prod.

Gate launch on: pgtap role matrix green + Playwright role-E2E green + advisor clean + manual test of all five role personas walking through core workflows.
