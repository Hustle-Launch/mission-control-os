import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createMiddleware, createStart } from "@tanstack/react-start";

/**
 * Signed-in surfaces. clerkMiddleware makes session cookies available on the server there so
 * SSR and OAuth callbacks don't thrash between a signed-out shell and the client session
 * (redirect loops after Google sign-in). Marketing pages skip it and stay cacheable.
 */
export const AUTH_PATH =
  /^\/(?:app|portal|sign-in|sign-up|onboarding|select-agency|api)(?:\/|$)/;

const clerk = clerkMiddleware();
const clerkOnAuthPages = createMiddleware().server((args) =>
  AUTH_PATH.test(new URL(args.request.url).pathname)
    ? clerk.options.server!(args as never)
    : args.next(),
);

export const startInstance = createStart(() => ({
  requestMiddleware: [clerkOnAuthPages],
}));
