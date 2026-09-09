# Smoke checklist — Agency auth after Google OAuth (#50 / #51)

Manual (preview or production-like Clerk keys — no empty `publishableKey`):

1. **Fresh Google sign-in (no org)**  
   - Sign in with Google → land on `/select-agency` (not a dead Sign-in modal).  
   - UI shows “Setup your agency” and **Signed in as …**.  
   - Enter a name → **Continue** → hard land on `/app` (or onboarding) within ~25s.  
   - If Clerk fails, an error appears; **Working…** must not hang forever.

2. **Existing membership**  
   - Sign in as a user with an Agency membership and no active org.  
   - `/select-agency` lists agencies → click one → `/app`.

3. **Pending task ≠ signed out**  
   - While `choose-organization` is pending, `/app` shows “Selecting Agency…” then redirects to `/select-agency` — never “Sign in to Mission Control” with a non-working CTA.  
   - `/portal` during the same task shows “Finish account setup” → Continue setup (not a signed-out portal card).

4. **Static guard (CI / local)**  
   ```bash
   bun run scripts/check-auth-pending-pattern.mjs
   ```
   Fails if Agency/portal/Convex auth surfaces regress to default `treatPendingAsSignedOut`.

Optional later: Playwright against preview with Clerk testing tokens.
