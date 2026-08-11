# Google API Integration, Auth Setup Paths & CLI Reference

This document serves as the implementation reference for building **`packages/google-integrations`** and **`apps/cli` (`mc-cli`)** in Mission Control OS (ADR-0047).

---

## 1. Reference Codebases & Inspiration Sources

When implementing the shared TypeScript libraries and Master CLI, engineers and AI agents should draw inspiration from the following open-source codebases and SDKs:

| Project / Repository | Primary Focus | Key Patterns to Emulate |
|---|---|---|
| **`@gsc-cli/cli`** | Google Search Console CLI & SDK | LLM-friendly CLI command structure, one-command OAuth setup, sitemap ingestion, structured `--format json` output for AI agents, URL inspection wrappers. |
| **`google-indexing-script`** | Google Indexing API Bulk Utilities | Batch URL queueing, quota tracking, handling batch request limits (max 200/day per service account/OAuth user), exponential backoff. |
| **`googleapis`** | Official Node.js/TS Google Client | Type definitions for `searchconsole_v1`, `indexing_v3`, `mybusinessbusinessinformation_v1`, `mybusinessaccountmanagement_v1`, `mybusinessverifications_v1`. |
| **`@google-analytics/data`** | Official GA4 Data API Client | `BetaAnalyticsDataClient` integration, dimension/metric query builder, active user/session/conversion aggregation. |
| **`@googleworkspace/cli`** | Open Source Google CLI | Authentication flow architecture, local token caching, CLI command extensibility. |
| **`commander` + `@clack/prompts`** | CLI Framework & UI | Type-safe subcommand routing (`mc-cli gsc ...`), interactive terminal prompts, formatted table views (`cli-table3`) with `--json` fallback. |

---

## 2. Authentication Setup Paths & API Security Architecture

Google APIs require distinct authentication setup paths depending on the caller surface (Web UI user, Client Portal, TUI, Master CLI, background worker, or AI subagent).

```mermaid
flowchart TD
  subgraph UserFlow ["Path A: User OAuth2 PKCE Flow"]
    U[Agency User / Client User] -->|OAuth Consent| G1[Google OAuth2 Server]
    G1 -->|Auth Code| CB[/api/connections/google/callback]
    CB -->|Refresh Token| CX[(Convex connections table)]
  end

  subgraph ServiceAccountFlow ["Path B: Service Account Flow"]
    SA[Service Account JSON Key] -->|JWT Sign| G2[Google API Services]
    SA -->|Unattended Cron/Polling| WK[Trigger.dev / Convex Schedulers]
  end

  subgraph EndpointFlow ["Path C: Control Plane API Routes (/api/google/*)"]
    REQ[Client / CLI / Agent Request] --> GATE{Auth Gate}
    GATE -->|Clerk JWT| WEB[Web / TUI / Desktop UI]
    GATE -->|AgentToken / API Key| CLI[Master CLI / AI Agent]
    WEB --> REF[google-auth-library Token Refresh]
    CLI --> REF
    REF --> GOOG[Outbound Google API Request]
  end
```

### Path A: User OAuth2 PKCE Flow & Connection Modes

Google OAuth connection supports **three authorization modes** (ADR-0039 / ADR-0047):

1. **Mode 1: Agency Master Connection (`scope: "agency_master"`)**:
   - **How it works**: Agency staff authorizes their primary agency Google Account / Manager Account / MCC once at the Agency settings level.
   - **Scope**: Applied automatically as the default fallback for all present and future Clients owned by that Agency.
   - **Ideal for**: Retainer clients managed directly under agency-owned GSC properties, GBP locations, or GA4 manager accounts.

2. **Mode 2: Direct Per-Client Connection (`scope: "client_direct"`)**:
   - **How it works**: Authorized specifically for a single target `ClientId` (or `LocationId`/`SiteId`) within the Client settings panel.
   - **Scope**: Scoped exclusively to that Client workspace; overrides or supplements the Agency Master connection for that client.
   - **Ideal for**: Clients with dedicated Google credentials or separate organizational OAuth setups.

3. **Mode 3: Client Self-Auth Invite Link (`scope: "client_invite"`)**:
   - **How it works**:
     - Agency staff generates a tokenized, single-use invite link via `POST /api/google/connections/invite` (or sends via Resend email).
     - The recipient (new client owner/admin) opens `/portal/connect/google?token=<invite_token>` without requiring an agency staff account.
     - Client completes Google OAuth consent for GSC, GBP, and GA4.
     - Tokens are automatically bound to that Client's Convex workspace (`clientId`).
   - **Ideal for**: Onboarding new clients who already have GSC/GBP/GA4 set up and need to safely delegate access to the agency without sharing passwords.

- **Endpoints**:
  - `GET /api/connections/google/auth` — Initiates Google OAuth2 authorization code flow with PKCE (`code_challenge`), accepting optional `clientId` and `scope` (`agency_master` | `client_direct` | `client_invite`).
  - `GET /api/connections/google/callback` — Handles OAuth redirect, exchanges code for tokens, and stores connection in Convex.
  - `POST /api/google/connections/invite` — Generates tokenized OAuth invite URL for new clients.
  - `POST /api/google/connections/claim` — Validates invite token and pairs OAuth tokens to client workspace upon OAuth completion.
- **Scopes Required**:
  - GSC: `https://www.googleapis.com/auth/webmasters.readonly`
  - Indexing API: `https://www.googleapis.com/auth/indexing`
  - GBP: `https://www.googleapis.com/auth/business.manage`
  - GA4: `https://www.googleapis.com/auth/analytics.readonly`
- **Token Storage**: Refresh tokens stored securely in Convex `connections` table (encrypted via KMS/app secret), tagged with `scope: "agency_master" | "client_direct" | "client_invite"`.


### Path B: Service Account JWT Flow (Unattended Background Automation)
- **Target Use Cases**: Nightly metric snapshots, automated indexing submissions, background health polling, and scheduled report generation via Trigger.dev workers or Convex schedulers.
- **Setup**: Service Account credentials (`client_email`, `private_key`) stored in environment secret (`GOOGLE_SERVICE_ACCOUNT_KEY`).
- **Delegation**: Service Account granted domain-wide delegation or explicitly added as a User/Owner to client Search Console properties and GBP locations.

### Path C: Control Plane API Endpoint Auth (`/api/google/*`)
All endpoints exposed under `/api/google/*` enforce strict authentication prior to delegating to `@mc/google-integrations`:

| Endpoint | Method | Allowed Authentication | Action Executed |
|---|---|---|---|
| `/api/google/gsc/inspect` | `POST` | Clerk JWT · AgentToken | Queries GSC Live URL Inspection API for target URL. |
| `/api/google/gsc/index` | `POST` | Clerk JWT · AgentToken | Submits batch indexing request for provided URLs. |
| `/api/google/gsc/metrics` | `GET` | Clerk JWT · AgentToken | Pulls clicks, impressions, CTR, position by site/query. |
| `/api/google/gbp/posts/add` | `POST` | Clerk JWT · AgentToken | Creates/schedules a GBP post with optional media. |
| `/api/google/gbp/metrics` | `GET` | Clerk JWT · AgentToken | Pulls local calls, messages, direction requests, search views. |
| `/api/google/ga4/metrics` | `GET` | Clerk JWT · AgentToken | Pulls active users, sessions, engagement rate, conversions. |
| `/api/google/report/aggregate` | `GET` | Clerk JWT · AgentToken | Merges GSC, GBP, and GA4 data into Unified Performance DTO. |

- **Token Refresh Handler**: Inside `@mc/google-integrations`, `google-auth-library` wraps all outbound requests in an `OAuth2Client`. It automatically checks token expiration (`expiry_date`) and executes transparent token refreshes prior to firing Google API calls.
