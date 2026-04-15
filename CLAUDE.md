# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Project overview

AgroCommand is an agricultural management platform built with **Next.js 16 (App Router) + React 19 + Supabase**. It gives farmers a full operational view across ten modules: operational monitoring, financial management, market intelligence, productivity, risk, logistics, ESG, competitive intelligence, and an executive war room.

The app is designed to be **multi-tenant with role-based access control** — see `docs/plans/MULTI_TENANT_IMPLEMENTATION_PLAN.md` and `docs/plans/RBAC_IMPLEMENTATION_PLAN.md` for the in-progress rollout and `docs/plans/PLAN_TRACKING.md` for status.

## Development commands

- `npm run dev` — start dev server (Turbopack is the default in Next 16; no flag needed)
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint (flat config, `eslint .`)

## Stack snapshot

- **Next.js 16.x** (App Router, Turbopack default, Fluid Compute on Vercel)
- **React 19**, async request APIs only (`await cookies()`, `await headers()`, `await props.params`)
- **Supabase** — Auth (email/password, Google OAuth, OTP), Postgres with RLS
- **TanStack Query** — server state; **Zustand** — client state; **React Hook Form + Zod** — forms
- **Tailwind 4** + **shadcn/ui** + Radix primitives
- **Framer Motion**, **@dnd-kit**, **Recharts**, **TanStack Table**
- **ESLint 9** flat config (`eslint.config.mjs`)

## Architecture

### Route groups

- `app/(auth)` — login, signup (public)
- `app/(dashboard)` — protected application routes; tenancy required
- `app/(external)` — public informational routes

### Dashboard modules (10)

1. Visão Executiva (`/dashboard`)
2. Monitoramento Operacional — operations map, fleet, weather sensors
3. Análise Financeira — overview, debt management, cash flow
4. Comercialização e Hedge — positions, market analysis, CPR
5. Produtividade e Qualidade — field performance, inputs, benchmarks
6. Gestão de Riscos — risk panel, scenarios, alerts
7. Logística e Armazenagem
8. ESG e Sustentabilidade
9. Inteligência Competitiva
10. Centro de Comando (War Room)

### Authentication

- Supabase Auth with email/password and Google OAuth; One-Tap via `components/google-one-tap.tsx`
- Request gate lives in **`proxy.ts`** (renamed from `middleware.ts` in Next 16) which runs `updateSession` from `utils/supabase/middleware.ts`
- Server client: `utils/supabase/server.ts` (uses `await cookies()`)
- Client provider: `components/auth/auth-provider.tsx` exposes `useAuthContext`; helper hook `hooks/use-auth.ts`

### Component architecture

- Server Components by default. Add `'use client'` only when you need interactivity.
- Global components in `/components/`; route-specific components in a sibling `components/` folder under the route.
- Loading: route-level `loading.tsx` + `components/skeletons/` + `components/loading/`.
- Errors: `components/error-boundary.tsx`.

### State management

| Concern | Tool |
|---|---|
| Server state, caching | TanStack Query |
| Client state | Zustand (see `stores/` — org-store planned) |
| Forms | React Hook Form + Zod schemas in `lib/validators/` |
| Auth context | `AuthProvider` via Context API |

### UI & styling

Tailwind 4 utilities, shadcn/ui components, `class-variance-authority` for variants, Framer Motion for transitions, Geist fonts.

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=     # optional
```

## Database & migrations

- Local config: `supabase/config.toml`
- Create migration: `supabase db diff -f <name>`
- Push: `supabase db push`
- Link: `supabase link --project-ref <ref>`
- Always run `mcp__supabase__get_advisors --type security` after DDL changes; zero ERROR-level lints is the bar.

## Multi-tenancy conventions

The app is organization-scoped. See `docs/plans/MULTI_TENANT_IMPLEMENTATION_PLAN.md` for the full model. Working rules:

1. **Every tenant-scoped table MUST have `organization_id uuid NOT NULL`** referencing `organizations(organization_id)`. Index it.
2. **Every tenant table MUST have RLS enabled** with a policy using `get_user_organization_ids()` (or the per-request `current_org_id()` once session context lands).
3. **The active org lives in cookie `ac_current_org`** (httpOnly). Read it via `utils/tenant/current-org.ts` and bind it to the Postgres session via `requireCurrentOrgId()` at the top of every tenant-touching server action, route handler, or server component.
4. **React Query keys MUST include `orgId`**: `['debt-portfolio', orgId, …]`. On org switch, call `queryClient.clear()`.
5. **Reference tables** (currency rates, commodity exchanges, units of measure, system config) are read-all + super-admin-write.
6. **Do not seed real data** into tables without RLS until Phase 1 of the tenant plan ships — any test org would see other tenants' rows.

## RBAC conventions

See `docs/plans/RBAC_IMPLEMENTATION_PLAN.md`. Working rules:

1. **Roles** (ranked): `owner` > `admin` > `manager` > `operator` > `viewer`. Stored on `organization_members.role`.
2. **Permissions** use `resource.action` format (`debt.update`, `members.invite`, …). Single source of truth is the `app_permission` enum in Postgres; the TS type in `lib/authz/permissions.ts` is generated from it.
3. **Authorization layers:**
   - **DB (hard boundary):** RLS policies call `authorize(org, permission)`.
   - **Server actions / route handlers (required):** `await requirePermission('x.y')` at the top.
   - **Server components:** `await can('x.y')` to conditionally render.
   - **Client components:** `<Can permission="x.y">…</Can>` + `useCan` for UX only — never trust.
4. **Last-owner guard:** a DB trigger blocks operations that would leave an org with zero owners. Respect it on the client by disabling the self-demote / remove control.
5. **Super-admin** (`user_profiles.is_super_admin`) bypasses role checks but every action is audit-logged with `actor_is_super_admin = true` and shows the impersonation banner.
6. **Never check roles by string comparison in app code** — use `has_role_at_least(role)` (SQL) or `useOrgRole().isAtLeast(role)` (client).

## Plans & tracking standards

Implementation plans live in `docs/plans/`. Every multi-phase effort (anything touching 3+ files or spanning more than a day) MUST have a plan document.

### Plan document structure

A plan `docs/plans/<NAME>_IMPLEMENTATION_PLAN.md` MUST include, in this order:

1. **Header** — status (Draft / In Progress / Shipped), target stack, scope summary, dependencies on other plans.
2. **Context & current state** — what exists, what's broken, explicit pointers to files/tables.
3. **Design decisions** — each decision with a short rationale. Call out trade-offs.
4. **Implementation phases** — numbered phases with concrete SQL / TS / file paths. Include migration names and example code.
5. **File-change checklist** — new files, modified files, new DB migrations (in the exact order they must apply).
6. **Testing plan** — unit (pgtap for DB), integration (RLS matrix), E2E (Playwright), advisor clean.
7. **Risks & mitigations** — table form.
8. **Rollout order** — timeline with gates.

Reference existing plans as templates: `MULTI_TENANT_IMPLEMENTATION_PLAN.md`, `RBAC_IMPLEMENTATION_PLAN.md`.

### Plan tracking

`docs/plans/PLAN_TRACKING.md` is the index of all plans. When you create a plan you MUST add it there with:
- Link + one-line description
- Dependencies
- Owner + dates
- Every phase and sub-task as a `[ ]` checkbox

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` deferred. Update checkboxes as work lands. When a plan is fully shipped, move its section under a **Completed plans** heading with the completion date.

### Plan hygiene

- **Don't write a plan for a two-line change** — plans are for efforts with migrations, new routes, or cross-cutting refactors.
- **Prefer `mcp__plugin_context7_context7__query-docs`** for any library/framework API mentioned in a plan to avoid stale-knowledge drift.
- **Cross-reference related plans** at the top (e.g. RBAC depends on Multi-Tenant Phase 2).
- **Never duplicate SQL or TS inside a plan that already exists in another plan** — link to the other plan's section instead.
- If a plan's design changes during implementation, update the plan file in the same PR that changes the code.

## Development patterns

### Adding a new route

1. Create the folder under the appropriate group in `app/` (e.g. `(dashboard)/new-module/`).
2. Add `page.tsx` (Server Component by default), a `loading.tsx`, and a local `components/` folder for route-specific UI.
3. If the route mutates data, start the server action / route handler with `await requirePermission('x.y')` and `await requireCurrentOrgId()`.
4. The proxy (`proxy.ts`) handles unauthenticated redirects automatically; no per-route auth boilerplate needed.

### Adding a new tenant-scoped table

1. Write migration that includes `organization_id uuid NOT NULL references organizations(organization_id)`, an index on `organization_id`, `alter table … enable row level security`, and the canonical policy from the tenant plan §2.3.
2. If writes happen via app code, add the `before insert` trigger `set_organization_id_from_context` so the column is auto-stamped from session.
3. Update the TS types via `supabase gen types`.
4. Run `mcp__supabase__get_advisors --type security` — must be clean.

### Component development

- Server Components by default for performance.
- `'use client'` only when you need `useState` / `useEffect` / event handlers / browser APIs.
- Route-specific components live next to the route; shared components in `/components/`.
- UI primitives come from `components/ui/` (shadcn) — don't reinvent.

### Auth integration

```typescript
import { useAuth } from '@/hooks/use-auth'

const { user, loading, signOut } = useAuth()
```

For server-side needs, prefer the Supabase server client (`utils/supabase/server.ts`) over passing user state through props.

## Important file locations

### Configuration
- `proxy.ts` — request gate + Supabase session refresh (Next 16 replaces `middleware.ts`)
- `eslint.config.mjs` — ESLint flat config
- `tsconfig.json` — `@/*` path aliases
- `components.json` — shadcn/ui config
- `supabase/config.toml` — Supabase local dev

### Core utilities
- `utils/supabase/` — client / server / middleware Supabase helpers
- `utils/tenant/` — current-org cookie + `requireCurrentOrgId` (being added per multi-tenant plan)
- `lib/authz/` — permissions enum, `can`, `requirePermission`, `withAuthz` (being added per RBAC plan)
- `lib/utils.ts` — general helpers
- `hooks/` — custom hooks (`use-auth`, `use-mobile`, upcoming `use-can`, `use-org-role`, `use-current-org`)

### UI
- `components/ui/` — shadcn primitives
- `components/loading/`, `components/skeletons/` — async UX
- `components/tenant/`, `components/members/`, `components/authz/`, `components/audit/`, `components/admin/` — tenancy & RBAC surfaces (being added)
- `app/layout.tsx` — root layout with AuthProvider, QueryProvider, ThemeProvider, ErrorBoundary
