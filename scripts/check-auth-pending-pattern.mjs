#!/usr/bin/env node
/**
 * Static smoke: pending Clerk session tasks must not be treated as signed-out
 * on agency/portal/Convex surfaces (#51).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    failures.push(`missing file: ${rel}`);
    return "";
  }
  return readFileSync(p, "utf8");
}

const clerkAuth = read("apps/web/src/lib/clerk-auth.ts");
if (!clerkAuth.includes("treatPendingAsSignedOut: false")) {
  failures.push("clerk-auth.ts must set treatPendingAsSignedOut: false");
}
if (!clerkAuth.includes("export function useMcAuth")) {
  failures.push("clerk-auth.ts must export useMcAuth");
}
if (!clerkAuth.includes("export function useAuthForConvex")) {
  failures.push("clerk-auth.ts must export useAuthForConvex");
}

const guards = read("apps/web/src/lib/auth-guards.tsx");
for (const needle of ["useMcAuth", "choose-organization", "Selecting Agency"]) {
  if (!guards.includes(needle)) failures.push(`auth-guards.tsx missing: ${needle}`);
}

const selectAgency = read("apps/web/src/routes/select-agency.tsx");
for (const needle of [
  "useMcAuth",
  "createOrganization",
  "setActive",
  'location.assign("/app")',
  "withTimeout",
]) {
  if (!selectAgency.includes(needle)) {
    failures.push(`select-agency.tsx missing: ${needle}`);
  }
}

const rootTsx = read("apps/web/src/routes/__root.tsx");
if (!rootTsx.includes("useAuth={useAuthForConvex}")) {
  failures.push("__root.tsx must pass useAuthForConvex to ConvexProviderWithClerk");
}
if (!rootTsx.includes('"choose-organization": "/select-agency"')) {
  failures.push("__root.tsx must map choose-organization → /select-agency");
}
const codeOnly = rootTsx
  .split("\n")
  .filter((line) => {
    const s = line.trim();
    return !s.startsWith("//") && !s.startsWith("*") && !s.startsWith("/*");
  })
  .join("\n");
if (/publishableKey\s*[:=]\s*[\"']{2}/.test(codeOnly)) {
  failures.push("__root.tsx must not override publishableKey with empty string");
}

const start = read("apps/web/src/start.ts");
if (!start.includes("clerkMiddleware")) {
  failures.push("start.ts must register clerkMiddleware for session cookies");
}

const docs = read("docs/auth-start-clerk.md");
if (!docs.includes("treatPendingAsSignedOut")) {
  failures.push("docs/auth-start-clerk.md missing treatPendingAsSignedOut guidance");
}

if (failures.length) {
  console.error("auth pending-pattern check FAILED:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
}

console.log("auth pending-pattern check OK");
