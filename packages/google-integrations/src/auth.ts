import type { ConnectedAccountScope, CreateGoogleAuthInviteBody, GoogleAuthInviteEnvelope } from "@mc/protocol";

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/indexing",
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/analytics.readonly",
] as const;

export interface BuildAuthUrlParams {
  clientId?: string;
  scope: ConnectedAccountScope;
  redirectUri: string;
  googleClientId: string;
  stateSecret?: string;
}

/**
 * Builds Google OAuth2 Authorization Code PKCE URL for agency master, client direct, or client invite flows.
 */
export function buildGoogleAuthUrl(params: BuildAuthUrlParams): { url: string; state: string } {
  const { clientId, scope, redirectUri, googleClientId, stateSecret = "mc-state" } = params;
  
  const statePayload = {
    scope,
    clientId: clientId ?? null,
    nonce: Math.random().toString(36).substring(2, 15),
    createdAt: Date.now(),
    secret: stateSecret,
  };
  
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const urlParams = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    state,
  });

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`,
    state,
  };
}

/**
 * Generates tokenized OAuth self-auth invitation link for new clients.
 */
export function createGoogleAuthInvite(params: CreateGoogleAuthInviteBody & { baseUrl: string }): GoogleAuthInviteEnvelope {
  const { clientId, expiresInDays = 7, baseUrl } = params;
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  
  const tokenPayload = {
    clientId,
    scope: "client_invite" as ConnectedAccountScope,
    expiresAt,
    nonce: Math.random().toString(36).substring(2, 15),
  };

  const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const inviteUrl = `${baseUrl.replace(/\/$/, "")}/portal/connect/google?token=${token}`;

  return {
    inviteUrl,
    token,
    expiresAt,
    clientId,
  };
}

/**
 * Validates a client self-auth invite token.
 */
export function parseGoogleAuthInviteToken(token: string): { valid: boolean; clientId?: string; error?: string } {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const payload = JSON.parse(raw);

    if (!payload.clientId || payload.scope !== "client_invite") {
      return { valid: false, error: "Invalid invite token scope" };
    }

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, error: "Invite token has expired" };
    }

    return { valid: true, clientId: payload.clientId };
  } catch {
    return { valid: false, error: "Malformed invite token" };
  }
}
