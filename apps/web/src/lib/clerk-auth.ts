import { useAuth } from "@clerk/tanstack-react-start";

/**
 * Agency + session-task surfaces must not treat pending Clerk tasks
 * (e.g. choose-organization) as signed-out. Default Clerk behavior
 * (`treatPendingAsSignedOut: true`) makes `isSignedIn === false` after
 * Google OAuth and strands users on a dead Sign-in CTA (#51).
 *
 * Use this (or pass the same option) on:
 * - AgencyGate / select-agency / cockpit chrome
 * - ConvexProviderWithClerk `useAuth` prop
 *
 * PortalGate also uses it so a pending org task never looks signed-out;
 * portal ACL still comes from Convex grants (ADR-0026), not Clerk org.
 */
export const PENDING_SESSION_AUTH = {
  treatPendingAsSignedOut: false,
} as const;

/** Client hooks: pending session tasks remain signed-in. */
export function useMcAuth() {
  return useAuth(PENDING_SESSION_AUTH);
}

/**
 * Stable reference for ConvexProviderWithClerk — same pending semantics
 * so SSR/OAuth cookies yield a JWT during choose-organization instead of
 * an empty signed-out Convex client.
 */
export function useAuthForConvex() {
  return useAuth(PENDING_SESSION_AUTH);
}
