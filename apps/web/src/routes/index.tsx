import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { LogoLockup } from "@/components/mc/logo";
import { Button } from "@/components/mc/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Rocket } from "lucide-react";
import { lazy, Suspense } from "react";
import { Magnetic } from "@/components/landing/Magnetic";

/** Keep R3F/drei/three out of the SSR/server function graph. */
const WorldStage = lazy(() =>
  import("@/components/landing/world-stage").then((m) => ({ default: m.WorldStage })),
);

const LaunchFinale = lazy(() =>
  import("@/components/landing/launch-finale").then((m) => ({ default: m.LaunchFinale })),
);

export const Route = createFileRoute("/")({
  component: Landing,
});

function FlightPlaceholder() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-[#11111b] text-sm text-[#a6adc8]"
      aria-hidden
    >
      Initializing Mission Control Space…
    </div>
  );
}

function Landing() {
  return (
    <div className="bg-[#11111b] text-[#cdd6f4] selection:bg-[#89dceb]/40 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#11111b]/70 px-5 py-3 backdrop-blur-2xl lg:px-10">
        <div className="mx-auto flex max-w-[1140px] items-center justify-between">
          <Link to="/" className="relative">
            <LogoLockup sky className="origin-left scale-[0.88]" />
          </Link>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <Magnetic strength={0.2}>
                  <Button size="sm" variant="ghost" className="text-xs text-[#a6adc8]">
                    Sign in
                  </Button>
                </Magnetic>
              </SignInButton>
              <Link to="/sign-up" className="hidden sm:block">
                <Magnetic strength={0.3}>
                  <Button size="sm" className="text-xs font-semibold">
                    Create agency
                  </Button>
                </Magnetic>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/app">
                <Magnetic strength={0.3}>
                  <Button size="sm" className="gap-1.5 text-xs font-semibold">
                    Open Cockpit <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Magnetic>
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* Hero Section — Solution Description, Value Prop & CTAs */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 pb-20 pt-32 lg:px-12 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-24 h-[500px] w-[500px] rounded-full bg-[#89dceb]/[0.08] blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[450px] w-[550px] rounded-full bg-[#f2cdcd]/[0.06] blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1140px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#89dceb]/30 bg-[#89dceb]/10 px-3.5 py-1 text-xs font-semibold text-[#89dceb] mb-6">
            <Rocket className="h-3.5 w-3.5" />
            <span>The All-In-One Agency Operating System</span>
          </div>

          <h1 className="max-w-[58rem] text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
            One cockpit for your agency.{" "}
            <span className="bg-gradient-to-r from-[#89dceb] via-[#cba6f7] to-[#f2cdcd] bg-clip-text text-transparent">
              Zero tool chaos.
            </span>
          </h1>

          <p className="mt-6 max-w-[42rem] text-base leading-relaxed text-[#a6adc8] sm:text-xl">
            Replace your fragmented tech stack. Unlimited technical site audits, dual agency & client CRMs, automated social approval calendars, and real-time white-label portals — unified in one powerful control center.
          </p>

          {/* Key Value Prop Pills */}
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-[#cdd6f4]">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3.5 py-2 border border-white/[0.08]">
              <CheckCircle2 className="h-4 w-4 text-[#89dceb]" />
              <span>Zero per-page crawler limits</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3.5 py-2 border border-white/[0.08]">
              <CheckCircle2 className="h-4 w-4 text-[#cba6f7]" />
              <span>Agency & Client dual CRM</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3.5 py-2 border border-white/[0.08]">
              <CheckCircle2 className="h-4 w-4 text-[#f2cdcd]" />
              <span>White-label client portal</span>
            </div>
          </div>

          {/* Hero CTAs with Magnetic Effect */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <Magnetic strength={0.4}>
                  <Button size="lg" className="gap-2.5 px-7 text-sm font-semibold shadow-[0_0_30px_rgba(137,220,235,0.3)]">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Magnetic>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link to="/app">
                <Magnetic strength={0.4}>
                  <Button size="lg" className="gap-2.5 px-7 text-sm font-semibold shadow-[0_0_30px_rgba(137,220,235,0.3)]">
                    Open Cockpit <ArrowRight className="h-4 w-4" />
                  </Button>
                </Magnetic>
              </Link>
            </Show>
            <a href="#flight">
              <Magnetic strength={0.25}>
                <Button variant="secondary" size="lg" className="text-sm border border-white/10">
                  Scan Mission Control Room
                </Button>
              </Magnetic>
            </a>
          </div>
        </div>
      </section>

      {/* 3D NASA Mission Control Room Panning Section */}
      <div id="flight">
        <ClientOnly fallback={<FlightPlaceholder />}>
          <Suspense fallback={<FlightPlaceholder />}>
            <WorldStage />
          </Suspense>
        </ClientOnly>
      </div>

      {/* Final Section — 3D Mission Launch Finale */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-28 text-center lg:px-12">
        {/* 3D Rocket Launch Canvas Background */}
        <div className="absolute inset-0 z-0">
          <ClientOnly fallback={null}>
            <Suspense fallback={null}>
              <LaunchFinale />
            </Suspense>
          </ClientOnly>
        </div>

        <div className="relative z-10 mx-auto max-w-[48rem] rounded-3xl border border-white/10 bg-[#11111b]/80 p-8 backdrop-blur-xl sm:p-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2cdcd]/30 bg-[#f2cdcd]/10 px-3.5 py-1 text-xs font-semibold text-[#f2cdcd] mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Ready for Ignition</span>
          </div>

          <h2 className="mx-auto text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to launch your agency's next level?
          </h2>

          <p className="mx-auto mt-6 max-w-[34rem] text-base leading-relaxed text-[#a6adc8] sm:text-lg">
            Stop wasting hours across mismatched tools. Unify technical audits, CRM, social approvals, and client reporting under one roof today.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <Magnetic strength={0.45}>
                  <Button size="lg" className="gap-2.5 px-8 text-base font-semibold shadow-[0_0_40px_rgba(242,205,205,0.4)]">
                    Launch Agency Free Trial <ArrowRight className="h-5 w-5" />
                  </Button>
                </Magnetic>
              </SignInButton>
              <Link to="/portal">
                <Magnetic strength={0.3}>
                  <Button variant="secondary" size="lg" className="text-sm border border-white/15">
                    Preview Client Portal
                  </Button>
                </Magnetic>
              </Link>
            </Show>

            <Show when="signed-in">
              <Link to="/app">
                <Magnetic strength={0.45}>
                  <Button size="lg" className="gap-2.5 px-8 text-base font-semibold shadow-[0_0_40px_rgba(137,220,235,0.4)]">
                    Go to Mission Control <ArrowRight className="h-5 w-5" />
                  </Button>
                </Magnetic>
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center justify-between gap-4 text-xs text-[#6c7086] sm:flex-row">
          <div className="flex items-center gap-3">
            <LogoLockup sky className="origin-left scale-[0.65]" />
            <span>© 2026 Mission Control OS</span>
          </div>
          <div className="flex gap-5">
            <a
              href="https://github.com/michaelmonetized/mission-control-os"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[#89dceb]"
            >
              GitHub
            </a>
            <Link to="/portal" className="transition-colors hover:text-[#89dceb]">
              Portal
            </Link>
            <Link to="/app/settings" className="transition-colors hover:text-[#89dceb]">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
