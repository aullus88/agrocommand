# Plan Tracking

Living index of implementation plans in `docs/plans/`. Check items off as they land. Keep phase ordering in sync with the source plan — re-number here if a plan gets restructured.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` deferred/cancelled

---

## 1. Multi-Tenant Implementation

Source: [`MULTI_TENANT_IMPLEMENTATION_PLAN.md`](./MULTI_TENANT_IMPLEMENTATION_PLAN.md)
Target: tenant isolation end-to-end + org/member/billing UI
Owner: _unassigned_
Started: _—_ · Completed: _—_

- [ ] **Phase 1 — Database hardening**
  - [ ] 1.1 Enable RLS + policies on broken tables (`debt_portfolio`, `sales_contracts`, `debt_payment_schedule`, `chart_of_accounts`, `cost_centers`)
  - [ ] 1.2 Add `organization_id` + RLS to orphan child tables (`debt_payments`, `plantings`, `lease_payments`, `lease_plot_allocations`, `operation_input_usage`, `inventory_movements*`, `transaction_line_items`, `report_cache`, `report_generation_log`, `scheduled_reports`)
  - [ ] 1.3 Fix `SECURITY DEFINER` views → `SECURITY INVOKER`
  - [ ] 1.4 Reference tables: explicit read-all + super-admin-write policies
  - [ ] 1.5 Session-context helpers (`set_current_org`, `current_org_id`)
  - [ ] 1.6 Verification: `get_advisors` returns zero ERROR-level lints

- [ ] **Phase 2 — App-layer session & server helpers**
  - [ ] 2.1 Cookie helper (`utils/tenant/current-org.ts`)
  - [ ] 2.2 Server helper that binds Postgres session (`requireCurrentOrgId`)
  - [ ] 2.3 Proxy enforcement (rewrite to `/select-organization` when cookie missing)
  - [ ] 2.4 Client org-context store (Zustand) + `OrgContextProvider`
  - [ ] 2.5 Server actions (`switchOrganization`, `createOrganization`, `updateOrganization`, `deleteOrganization`, `leaveOrganization`, `getMyOrganizations`)
  - [ ] 2.6 React Query keys include `orgId` + cache clear on switch

- [ ] **Phase 3 — New UI surfaces**
  - [ ] 3.1 Route inventory (new routes scaffolded)
    - [ ] `/select-organization`
    - [ ] `/onboarding/create-organization`
    - [ ] `/invites/[token]`
    - [ ] `/settings/organization` (+ `limits`, `danger-zone`)
    - [ ] `/settings/members` (+ `[memberId]`)
    - [ ] `/settings/invites`
    - [ ] `/settings/billing`
    - [ ] `/settings/audit-log`
    - [ ] `/super-admin/organizations` (+ `[id]`)
    - [ ] `/super-admin/users`
    - [ ] `/super-admin/advisors`
  - [ ] 3.2 Sidebar changes (OrgSwitcher, real user data, admin & super-admin groups)
  - [ ] 3.3 Component inventory
    - [ ] `components/tenant/*` (org-switcher, org-badge, org-guard, trial-banner, plan-limits-card, usage-meter, create-org-dialog, delete-org-dialog, leave-org-dialog, transfer-ownership-dialog)
    - [ ] `components/members/*` (member-list, member-row-actions, invite-member-dialog, invite-list, invite-accept-card)
    - [ ] `components/audit/*` (audit-log-table, audit-log-filters)
    - [ ] `components/admin/*` (org-admin-table, user-admin-table, impersonation-banner)
  - [ ] 3.4 Page specs shipped
    - [ ] `/select-organization` (0/1/many orgs branching)
    - [ ] `/onboarding/create-organization`
    - [ ] `/settings/organization` (tabs: Geral/Localização/Endereço/Marca/Preferências)
    - [ ] `/settings/organization/limits` (usage vs. plan)
    - [ ] `/settings/members`
    - [ ] `InviteMemberDialog` + email send
    - [ ] `/invites/[token]`
    - [ ] `/settings/billing` (stub)
    - [ ] `/settings/audit-log`
    - [ ] `/super-admin/organizations` (+ impersonation banner)
  - [ ] 3.5 New DB objects
    - [ ] `organization_invites` table + RLS
    - [ ] `audit_log` table + RLS
    - [ ] `org_usage_summary(p_org)` RPC

- [ ] **Phase 4 — Audit & observability**
  - [ ] `withAudit` wrapper in `lib/audit.ts`
  - [ ] Wire every mutating server action through `withAudit`
  - [ ] `audit_log_search` RPC + paginated table UI
  - [ ] Super-admin actions logged with `actor_is_super_admin = true`

- [ ] **Phase 5 — Optional JWT custom-claim hook (performance)**
  - [ ] Install `custom_access_token_hook`
  - [ ] Enable in Supabase dashboard
  - [ ] Refactor `get_user_organization_ids()` to prefer JWT claim
  - [ ] Measure P95 before/after

---

## 2. RBAC Implementation

Source: [`RBAC_IMPLEMENTATION_PLAN.md`](./RBAC_IMPLEMENTATION_PLAN.md)
Depends on: Multi-Tenant Phase 2 (current-org context)
Target: full role + permission enforcement at DB / server / client layers + management UI
Owner: _unassigned_
Started: _—_ · Completed: _—_

- [ ] **Phase 1 — Permissions taxonomy + role matrix (DB)**
  - [ ] `app_permission` enum (SQL)
  - [ ] `role_permissions` table
  - [ ] Seed role → permission matrix (per §2.4 of plan)

- [ ] **Phase 2 — Authorization helpers (DB)**
  - [ ] `role_rank(role)`
  - [ ] `has_role_at_least(org, role)`
  - [ ] `authorize(org, permission)` with JWT → DB fallback
  - [ ] `can(permission)` wrapper scoped to current-org session

- [ ] **Phase 3 — Tighter RLS policies using `authorize`**
  - [ ] Split tenant policies into read / insert / update / delete per permission on every tenant table
  - [ ] Feature flag `rbac_policies_enforced` in `system_config` (OR coexistence during soak)
  - [ ] Remove old membership-only policies once flag flipped

- [ ] **Phase 4 — Custom access token hook (JWT claims)**
  - [ ] `custom_access_token_hook` function installed
  - [ ] Grants on `organization_members` / `user_profiles` to `supabase_auth_admin`
  - [ ] Enable hook in Supabase dashboard
  - [ ] Verify `app_metadata.roles` map in a live session
  - [ ] `refreshSession()` on role change

- [ ] **Phase 5 — Server-side authorization layer**
  - [ ] 5.1 `lib/authz/permissions.ts` (TS enum generated from DB)
  - [ ] 5.2 `lib/authz/server.ts` (`getMyRole`, `can`, `requirePermission`, `requireRoleAtLeast`)
  - [ ] 5.3 `lib/authz/route.ts` (`withAuthz` wrapper)
  - [ ] CI check that TS enum ↔ SQL enum stay in sync

- [ ] **Phase 6 — Client-side gates**
  - [ ] 6.1 `hooks/use-can.ts`
  - [ ] 6.1 `components/authz/can.tsx`
  - [ ] 6.2 `hooks/use-org-role.ts` (`role`, `rank`, `isAtLeast`)

- [ ] **Phase 7 — UI surfaces**
  - [ ] 7.1 Sidebar reshape — wrap each nav group in `<Can>` with correct permission
  - [ ] 7.2 New pages
    - [ ] `/settings/roles` (role × permission matrix, read-only)
    - [ ] `/settings/roles/[role]` (v2 stub)
    - [ ] `/settings/permissions` (developer reference)
  - [ ] 7.3 Components
    - [ ] `components/authz/can.tsx`
    - [ ] `components/authz/role-badge.tsx`
    - [ ] `components/authz/role-select.tsx` (disables roles > caller's)
    - [ ] `components/authz/permission-matrix-table.tsx`
    - [ ] `components/authz/permission-diff.tsx`
    - [ ] `components/authz/change-role-dialog.tsx` (last-owner guard)
    - [ ] `components/authz/transfer-ownership-dialog.tsx`
    - [ ] `components/authz/no-access-empty-state.tsx`
  - [ ] 7.4 Page specs shipped
    - [ ] `/settings/members/[memberId]` tabs (Perfil / Papel / Permissões / Histórico)
    - [ ] `/settings/roles` matrix view
    - [ ] `/settings/permissions` reference list
  - [ ] 7.5 Audit existing mutating pages — prepend `requirePermission(...)` to every mutating server action / route handler

- [ ] **Phase 8 — Audit trail for role/permission changes**
  - [ ] Actions wired: `member.role_changed`, `member.permissions_changed`, `member.removed`, `member.invited`, `member.invite_revoked`, `owner.transferred`, `super_admin.enabled`, `super_admin.disabled`
  - [ ] `diff` column populated with `{ before, after }`
  - [ ] Visible in `/settings/audit-log` with filter by target member

---

## Testing & launch gates

- [ ] Supabase advisors (security): zero ERROR-level lints
- [ ] RLS regression suite: role × table × CRUD matrix green
- [ ] pgtap RBAC unit tests green
- [ ] Playwright E2E: five role personas walk through core workflows
- [ ] Invite → accept → role change → last-owner guard path manually verified
- [ ] JWT hook claim verified in live session
- [ ] Super-admin impersonation banner visible + audit-logged

---

## How to use this file

1. When starting a phase: change `[ ]` → `[~]` and fill the date at the top of the plan section.
2. When completing a phase: `[~]` → `[x]`. Also check off every child item.
3. If a phase is dropped or descoped: `[-]` with a one-line note.
4. When a plan is fully shipped: move its section to a **Completed plans** heading at the bottom of this file and include the completion date.
5. New plans added to `docs/plans/` must append a new numbered section here with the same structure (link + phase tree).
