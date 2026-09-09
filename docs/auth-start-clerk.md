# Auth on TanStack Start + Clerk

Mission Control uses **Clerk** (TanStack Start SDK) for human identity and **Clerk Organizations** as Agencies (ADR-0015). Client portal users stay **outside** the Agency org; Convex grants authorize them (ADR-0026).

## Session tasks vs signed-out

After Google OAuth, Clerk may park the session on a **session task** such as `choose-organization` before the session is fully active.

Clerk’s default `useAuth()` option is `treatPendingAsSignedOut: true`. That makes `isSignedIn === false` during the task, which used to render a dead “Sign in” modal on `/app` and related gates (#51).

**Rule:** any surface that can render during a pending session task must use:

```ts
useAuth({ treatPendingAsSignedOut: false })
// or the shared helper:
import { useMcAuth, useAuthForConvex } from "@/lib/clerk-auth";
```

Wired today:

| Surface | Helper / option |
| --- | --- |
| `AgencyGate` | `useMcAuth()` |
| `/select-agency` | `useMcAuth()` |
| `PortalGate` | `useMcAuth()` (+ explicit setup CTA if task pending) |
| Cockpit chrome | `useMcAuth()` |
| `ConvexProviderWithClerk` | `useAuthForConvex` |

Do **not** pass `publishableKey=""` into `ClerkProvider` — an empty string overrides SSR/middleware init and leaves Clerk dead (`isSignedIn` stuck false). Only pass the key when `VITE_CLERK_PUBLISHABLE_KEY` is set (see `__root.tsx`).

## Agency create / select (#50)

`ClerkProvider` maps the task to our route:

```ts
taskUrls: { "choose-organization": "/select-agency" }
```

`/select-agency` uses a **custom** create/select form (`createOrganization` + `setActive`), **not** `TaskChooseOrganization`. Under TanStack Start, Clerk’s hosted task UI + SPA `routerPush` can hang forever on Continue.

After activation we **hard-navigate** to `/app`:

```ts
window.location.assign("/app")
```

passed as `setActive({ organization, navigate })`, with a fallback `assign` and a **25s timeout** so “Working…” cannot spin forever — failures surface as inline errors.

`AgencyGate` redirects `choose-organization` (or signed-in with no `orgId`) → `/select-agency` without a signed-out modal loop.

## Cookies / SSR

`apps/web/src/start.ts` registers `clerkMiddleware()` so session cookies are available on the server. Without it, OAuth callbacks thrash between a signed-out SSR shell and a client session (redirect loops).

## Portal grants

Portal authorization is **Convex** (`portalGrants` / allowlist), not Clerk org membership. Pending org tasks must not be shown as “signed out” on `/portal`; if Clerk still emits `choose-organization` (dashboard “organization required”), `PortalGate` points at `/select-agency` to finish the session task, then the user can return to the portal.

For portal-capable deployments, prefer **not** requiring an organization for every Clerk user in the Dashboard; Agency onboarding still works via `taskUrls` when membership is missing.

## Keys

Use preview / production-like Clerk publishable keys only (`VITE_CLERK_PUBLISHABLE_KEY`). Never ship an empty override.

## Related commits

- `952df93` — OAuth redirect loop / middleware
- `19fd132` — pending task UI + `treatPendingAsSignedOut: false`
- `db510f8` — custom org form + hard redirect
