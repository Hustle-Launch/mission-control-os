import { describe, expect, test } from "bun:test";
import { buildGoogleAuthUrl, createGoogleAuthInvite, parseGoogleAuthInviteToken } from "./auth";

describe("Google OAuth Auth Helpers", () => {
  test("buildGoogleAuthUrl constructs correct URL and state for agency_master", () => {
    const { url, state } = buildGoogleAuthUrl({
      scope: "agency_master",
      redirectUri: "http://localhost:3000/api/connections/google/callback",
      googleClientId: "test-client-id",
    });

    expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url).toContain("client_id=test-client-id");
    expect(url).toContain("response_type=code");
    expect(url).toContain("scope=");
    expect(state).toBeTruthy();

    const decodedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    expect(decodedState.scope).toBe("agency_master");
    expect(decodedState.clientId).toBeNull();
  });

  test("buildGoogleAuthUrl constructs correct state for client_direct", () => {
    const { state } = buildGoogleAuthUrl({
      clientId: "client_123",
      scope: "client_direct",
      redirectUri: "http://localhost:3000/api/connections/google/callback",
      googleClientId: "test-client-id",
    });

    const decodedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    expect(decodedState.scope).toBe("client_direct");
    expect(decodedState.clientId).toBe("client_123");
  });

  test("createGoogleAuthInvite & parseGoogleAuthInviteToken round-trip", () => {
    const invite = createGoogleAuthInvite({
      clientId: "client_acme",
      baseUrl: "https://app.agency.com",
      expiresInDays: 7,
    });

    expect(invite.clientId).toBe("client_acme");
    expect(invite.inviteUrl).toContain("https://app.agency.com/portal/connect/google?token=");
    expect(invite.token).toBeTruthy();

    const parsed = parseGoogleAuthInviteToken(invite.token);
    expect(parsed.valid).toBe(true);
    expect(parsed.clientId).toBe("client_acme");
  });

  test("parseGoogleAuthInviteToken rejects invalid or expired token", () => {
    const invalidRes = parseGoogleAuthInviteToken("invalid_junk_token");
    expect(invalidRes.valid).toBe(false);

    // Expired token test
    const expiredPayload = {
      clientId: "client_acme",
      scope: "client_invite",
      expiresAt: Date.now() - 10000,
    };
    const expiredToken = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const expiredRes = parseGoogleAuthInviteToken(expiredToken);
    expect(expiredRes.valid).toBe(false);
    expect(expiredRes.error).toBe("Invite token has expired");
  });
});
