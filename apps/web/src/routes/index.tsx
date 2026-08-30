import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { LogoLockup } from "@/components/mc/logo";
import { Button } from "@/components/mc/button";
import {
  ArrowRight,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  UsersRound,
  Megaphone,
  Inbox,
  Bot,
  Globe,
  LayoutGrid,
  Command,
  ChevronRight,
} from "lucide-react";
import { lazy, Suspense } from "react";

const WorldStage = lazy(() =>
  import("@/components/landing/world-stage").then((m) => ({ default: m.WorldStage })),
);

export const Route = createFileRoute("/")({
  component: Landing,
});

function FlightPlaceholder() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-black/5 bg-white text-sm text-zinc-500">
      Loading flight…
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-600 shadow-sm">
      {children}
    </span>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{children}</p>
  );
}

// ── page ─────────────────────────────────────────────────────────────────

function Landing() {
  return (
    <div className="bg-[#FCFCF9] text-[#0b0b0f] selection:bg-[#89dceb]/30">
      {/* Header — raycast-like: thin, airy, nav center */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#FCFCF9]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between gap-6 px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <LogoLockup className="scale-[0.78] origin-left [&_span]:!text-[#0b0b0f]" />
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-medium text-zinc-500 md:flex">
            <a href="#capabilities" className="rounded-full px-3 py-1.5 hover:bg-black/[0.04] hover:text-zinc-900 transition">Capabilities</a>
            <a href="#surfaces" className="rounded-full px-3 py-1.5 hover:bg-black/[0.04] hover:text-zinc-900 transition">Surfaces</a>
            <a href="#flight" className="rounded-full px-3 py-1.5 hover:bg-black/[0.04] hover:text-zinc-900 transition">Audit</a>
            <a href="#pricing" className="rounded-full px-3 py-1.5 hover:bg-black/[0.04] hover:text-zinc-900 transition">Pricing</a>
            <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="rounded-full px-3 py-1.5 hover:bg-black/[0.04] hover:text-zinc-900 transition">GitHub</a>
          </nav>

          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <button className="hidden sm:inline-flex rounded-full px-4 py-2 text-[13px] font-medium text-zinc-600 hover:bg-black/[0.06] hover:text-zinc-900 transition">
                  Log in
                </button>
              </SignInButton>
              <Link to="/sign-up" className="hidden sm:block">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b0f] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-zinc-800 transition">
                  Create agency <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                </span>
              </Link>
              {/* mobile CTA */}
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <span className="inline-flex sm:hidden items-center rounded-full bg-[#0b0b0f] px-4 py-2 text-[13px] font-medium text-white">Sign in</span>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link to="/app">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b0f] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-zinc-800 transition">
                  Open Cockpit <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <span className="ml-1"><UserButton /></span>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero — centered like raycast */}
      <section className="relative overflow-hidden px-6 pb-8 pt-14 sm:pt-20 lg:px-8">
        {/* subtle grid + warm wash */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
          <div className="absolute left-1/2 top-[-120px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#89dceb]/20 via-[#cba6f7]/15 to-[#f2cdcd]/20 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-[1200px] text-center">
          <div className="flex justify-center">
            <Pill>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              New: Local Agent + rendered crawl — zero per-page fees
              <span className="hidden sm:inline-flex items-center gap-1 text-zinc-400">· <a href="#flight" className="hover:text-zinc-700 underline-offset-2 hover:underline">Take the flight</a></span>
            </Pill>
          </div>

          <h1 className="mx-auto mt-8 max-w-[780px] text-[40px] font-[700] leading-[0.95] tracking-[-0.04em] text-[#0b0b0f] sm:text-[64px] lg:text-[72px]">
            Your shortcut to
            <br />
            <span className="bg-gradient-to-r from-[#ff4d4d] via-[#ff8a5b] to-[#0ea5e9] bg-clip-text text-transparent">every client.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[560px] text-[16px] leading-6 text-zinc-500 sm:text-[17px]">
            A collection of agency superpowers — audit, CRM, social, email, automations and a real client portal — inside one extendable cockpit.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:bg-zinc-800 transition cursor-pointer">
                  Create agency — free <ArrowRight className="h-4 w-4" />
                </span>
              </SignInButton>
              <Link to="/sign-in">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[14px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition">
                  <Command className="h-4 w-4" /> Open cockpit
                </span>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/app">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:bg-zinc-800 transition">
                  Open Cockpit <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Show>
          </div>
          <p className="mt-3 text-xs text-zinc-400">No credit card. Self Client auto-created on signup.</p>

          {/* Launcher mock — the raycast window */}
          <div className="relative mx-auto mt-12 max-w-[860px]">
            <div className="relative overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.03)]">
              {/* window chrome */}
              <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#fafaf8] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] border border-black/10" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-black/10" />
                <span className="h-3 w-3 rounded-full bg-[#28c940] border border-black/10" />
                <span className="ml-3 text-xs font-medium text-zinc-400">Mission Control — ⌘K</span>
                <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">Local Agent · live</span>
              </div>

              {/* search bar */}
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 sm:px-5">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  readOnly
                  value="crawl acme — rendered, ignore robots off"
                  className="w-full bg-transparent text-[14px] font-medium text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
                />
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-1 text-[10px] font-medium text-zinc-500">↵ run</span>
              </div>

              {/* results list */}
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1.4fr_0.9fr]">
                <div className="divide-y divide-black/[0.05] text-left">
                  {[
                    { icon: Globe, label: "Start Crawl Run", desc: "acme.example · Rendered · 2.4k URLs", hotkey: "↵", active: true },
                    { icon: Layers, label: "Open Issue Cluster", desc: "12× Missing canonical — /blog/*", hotkey: "⌘ ↵" },
                    { icon: UsersRound, label: "Find Contact", desc: "Maya Patel — Acme Co · Owner", hotkey: "⌘ C" },
                    { icon: Megaphone, label: "Schedule Social Post", desc: "Queue for approval calendar — 2 wk look-ahead", hotkey: "⌘ S" },
                    { icon: Inbox, label: "Open Conversation", desc: "Re: Proposal — unread · SMS + Email", hotkey: "⌘ O" },
                  ].map((r) => (
                    <div key={r.label} className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${r.active ? "bg-[#f4f4f0]" : "hover:bg-zinc-50"}`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${r.active ? "bg-white border-black/10 text-[#0b0b0f]" : "bg-zinc-50 border-black/5 text-zinc-500"}`}>
                        <r.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium leading-none text-zinc-900">{r.label}</p>
                        <p className="mt-1 truncate text-xs text-zinc-500">{r.desc}</p>
                      </div>
                      <span className="hidden sm:inline-flex rounded-md bg-white px-1.5 py-1 text-[10px] font-medium text-zinc-500 ring-1 ring-black/10">{r.hotkey}</span>
                    </div>
                  ))}
                </div>

                {/* right detail pane */}
                <div className="hidden border-l border-black/[0.06] bg-[#fafaf8] p-4 text-left sm:block">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Crawl preview</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">acme.example</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">Rendered</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { k: "Pages", v: "2,431" },
                        { k: "Issues", v: "87" },
                        { k: "Health", v: "92%" },
                      ].map((s) => (
                        <div key={s.k} className="rounded-lg bg-zinc-50 px-2 py-2 ring-1 ring-black/5">
                          <p className="text-[11px] font-semibold text-zinc-900">{s.v}</p>
                          <p className="text-[10px] uppercase tracking-wide text-zinc-500">{s.k}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Streaming to Convex · live findings
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#89dceb] to-[#f2cdcd]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                    Agent runs on your metal. Artifacts stay local; findings stream to the Control Plane — no per-page billing.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-black/10">⌘K — palette</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-black/10">/ — command</span>
                  </div>
                </div>
              </div>

              {/* footer hint */}
              <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#fafaf8] px-4 py-2 text-[11px] text-zinc-500">
                <span className="hidden sm:inline">Press <kbd className="rounded border border-black/10 bg-white px-1 py-0.5">↑↓</kbd> to navigate · <kbd className="rounded border border-black/10 bg-white px-1 py-0.5">↵</kbd> to run</span>
                <span className="sm:ml-auto inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-amber-500" /> Flat SaaS · Own the loop</span>
              </div>
            </div>

            {/* soft glow behind */}
            <div className="pointer-events-none absolute -inset-x-8 -bottom-10 -z-10 h-40 bg-gradient-to-t from-[#89dceb]/15 via-[#f2cdcd]/10 to-transparent blur-2xl" />
          </div>
        </div>
      </section>

      {/* Trust / logos — raycast social proof strip */}
      <section className="border-y border-black/[0.06] bg-white px-6 py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Built for agencies who ship</p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-zinc-400">
            <span className="inline-flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-zinc-900" />Local SEO</span>
            <span className="inline-flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-zinc-200 ring-1 ring-black/5" />Technical Audit</span>
            <span className="inline-flex items-center gap-2"><span className="h-6 w-6 rounded-lg bg-gradient-to-br from-sky-400 to-fuchsia-400" />Client Portal</span>
            <span className="hidden sm:inline-flex items-center gap-2 text-zinc-500">+ CRM · Email · Social · Automations</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-zinc-500 lg:flex">
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-white font-medium">Flat pricing</span>
            <span>Starter · Pro · Enterprise</span>
          </div>
        </div>
      </section>

      {/* Bento — "There's an extension for that." */}
      <section id="capabilities" className="bg-[#FCFCF9] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Capabilities</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0b0b0f] sm:text-4xl">
              There&apos;s a cockpit for that.
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-zinc-500">
              Use your favourite workflows without opening twelve tools. Audit, pipeline, inbox and calendar — one protocol.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Technical Audit", desc: "Rendered crawl, open issues, duplicate clusters & a11y — streamed live.", icon: Search, accent: "#89dceb" },
              { title: "Local Agent", desc: "Rust daemon on your metal. No per-page bills. Artifacts stay local.", icon: Bot, accent: "#74c7ec" },
              { title: "Dual CRM", desc: "Agency CRM + Client CRM. Same primitive, partitioned workspaces.", icon: UsersRound, accent: "#cba6f7" },
              { title: "Social Calendar", desc: "Schedule once, approve in the N-week look-ahead. No gatekeeping.", icon: Megaphone, accent: "#f2cdcd" },
              { title: "Email & Automations", desc: "Domains via Resend, templates, trigger→action — inline then Trigger.dev.", icon: Inbox, accent: "#a6e3a1" },
              { title: "Client Portal", desc: "ACL-gated, branded. Shared findings, graphs, approval calendar.", icon: LayoutGrid, accent: "#fab387" },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-[20px] border border-black/[0.07] bg-white p-6 shadow-sm transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-zinc-50 text-zinc-700" style={{ boxShadow: `0 0 20px ${c.accent}30` }}>
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-zinc-900">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">{c.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-900 opacity-0 transition group-hover:opacity-100">
                  Learn more <ChevronRight className="h-3 w-3" />
                </span>
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl" style={{ background: c.accent }} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Link to="/app" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">
              Browse all capabilities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Speed / ergonomic / reliable — raycast keyboard grid */}
      <section className="border-y border-black/[0.06] bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { k: "Fast.", v: "Rendered by default. Stream findings to Convex as they land — no poll.", icon: Zap },
            { k: "Ergonomic.", v: "⌘K everywhere. Sparse cockpit, progressive disclosure — not widget walls.", icon: Command },
            { k: "Reliable.", v: "Inline automations, then Trigger.dev retries. Publish failures auto-reschedule.", icon: ShieldCheck },
          ].map((s) => (
            <div key={s.k} className="text-center sm:text-left">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-zinc-50 text-zinc-700 sm:mx-0">
                <s.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-zinc-900">{s.k}</p>
              <p className="mt-1 text-sm leading-5 text-zinc-500">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Surfaces — alternating feature */}
      <section id="surfaces" className="bg-[#f6f6f3] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionEyebrow>Surfaces</SectionEyebrow>
            <h2 className="mt-3 max-w-[520px] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-900 sm:text-4xl">
              Web. Desktop. Terminal. Phone. Equal.
            </h2>
            <p className="mt-4 max-w-[520px] text-sm leading-6 text-zinc-600">
              One sync fabric. TanStack Start + Clerk + Convex on the Control Plane. Electron + Effect hosts the Agent. TUI for the shell-dwellers. No second-class viewers.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-600">
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />Desktop installs & repairs the daemon — not a child process.</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />Agent Token in OS keychain. Sync over WebSocket, jobs & presence.</li>
              <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />Mobile & TUI talk the same protocol — same Audit Loop.</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Open app <ArrowRight className="h-4 w-4" /></Link>
              <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-700">GitHub <ChevronRight className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Web — Cockpit", sub: "Audit loop · live" },
                { label: "Desktop — Agent", sub: "LaunchAgent · systemd" },
                { label: "TUI — Ops", sub: "Keyboard-first" },
                { label: "Mobile — Triage", sub: "On-call" },
              ].map((t) => (
                <div key={t.label} className="rounded-[14px] border border-black/5 bg-[#fafaf8] p-4">
                  <p className="text-xs font-semibold text-zinc-900">{t.label}</p>
                  <p className="text-xs text-zinc-500">{t.sub}</p>
                  <div className="mt-3 h-20 rounded-lg bg-gradient-to-br from-zinc-100 to-white ring-1 ring-black/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flight — keep WorldStage but raycast-contained */}
      <section id="flight" className="bg-[#FCFCF9] px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Flight</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-4xl">Scroll to fly the agency.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">Five stations — Command, Agent, CRM, Surfaces, Portal — pinned and scrubbed with GSAP. Reduced-motion falls back to a calm list.</p>
          </div>
          <div className="mt-8 overflow-hidden rounded-[24px] border border-black/10 bg-[#11111b] shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <ClientOnly fallback={<FlightPlaceholder />}>
              <Suspense fallback={<FlightPlaceholder />}>
                <WorldStage />
              </Suspense>
            </ClientOnly>
          </div>
        </div>
      </section>

      {/* Pricing tease + testimonials like raycast */}
      <section id="pricing" className="bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionEyebrow>Pricing</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-zinc-900">Stop renting crawlers. Own the loop.</h2>
              <p className="mt-3 max-w-[520px] text-sm leading-6 text-zinc-600">
                Screaming Frog depth. Sitebulb prioritisation. Client-ready portal. One flat plan — Starter, Pro, or Enterprise. No per-page meter.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { name: "Starter", price: "$49", note: "per month" },
                  { name: "Pro", price: "$149", note: "per month", featured: true },
                  { name: "Enterprise", price: "Talk", note: "to us" },
                ].map((p) => (
                  <div key={p.name} className={`rounded-2xl border p-4 text-center ${p.featured ? "border-zinc-900 bg-zinc-900 text-white shadow-lg" : "border-black/10 bg-white"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${p.featured ? "text-zinc-400" : "text-zinc-500"}`}>{p.name}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">{p.price}</p>
                    <p className={`text-xs ${p.featured ? "text-zinc-400" : "text-zinc-500"}`}>{p.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal" fallbackRedirectUrl="/app">
                    <span className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white">Start free <ArrowRight className="h-4 w-4" /></span>
                  </SignInButton>
                  <Link to="/portal" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700">Client portal preview</Link>
                </Show>
                <Show when="signed-in">
                  <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white">Mission Control <ArrowRight className="h-4 w-4" /></Link>
                </Show>
              </div>
            </div>

            <div className="rounded-[20px] border border-black/5 bg-[#f6f6f3] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Loved by operators</p>
              <div className="mt-4 space-y-4">
                {[
                  { q: "Finally a crawler we own. The portal alone killed our PDF busywork.", a: "Agency Owner · 32 locations" },
                  { q: "The dual CRM is the unlock — same tool for us and clients, no sync hell.", a: "Ops Lead · Multi-tenant" },
                  { q: "TUI + ⌘K. I live in there. Feels like Raycast for local SEO.", a: "Technical SEO · Power user" },
                ].map((t) => (
                  <div key={t.q} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm leading-6 text-zinc-700">“{t.q}”</p>
                    <p className="mt-2 text-xs font-medium text-zinc-500">— {t.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — like raycast "Take the short way" */}
      <section className="border-y border-black/[0.06] bg-[#f6f6f3] px-6 py-14 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-3xl">Take the short way.</h2>
            <p className="mt-2 text-sm text-zinc-500">Download for your OS — or open the cockpit in the browser. Same fabric.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Show when="signed-out">
              <Link to="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black">
                Create agency <ArrowRight className="h-4 w-4" />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black">
                Open Cockpit <ArrowRight className="h-4 w-4" />
              </Link>
            </Show>
            <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer — multi-column like raycast */}
      <footer className="bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 text-sm lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <LogoLockup className="scale-[0.72] origin-left [&_span]:!text-zinc-900" />
            <p className="mt-3 max-w-[220px] text-xs leading-5 text-zinc-500">Mission Control OS — the agency operating system. Audit, CRM, portal & multi-surface ops.</p>
            <p className="mt-4 text-xs text-zinc-400">© 2026 Mission Control</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Product</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li><a href="#capabilities" className="hover:text-zinc-900">Capabilities</a></li>
              <li><a href="#surfaces" className="hover:text-zinc-900">Surfaces</a></li>
              <li><a href="#flight" className="hover:text-zinc-900">Audit Flight</a></li>
              <li><Link to="/portal" className="hover:text-zinc-900">Client Portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Platform</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li><Link to="/app" className="hover:text-zinc-900">Cockpit</Link></li>
              <li><a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="hover:text-zinc-900">Desktop Agent</a></li>
              <li><span className="text-zinc-400">TUI · Mobile</span></li>
              <li><a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="hover:text-zinc-900">GitHub</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Company</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li><Link to="/app/settings" className="hover:text-zinc-900">Pricing</Link></li>
              <li><a href="mailto:hello@mission-control.os" className="hover:text-zinc-900">Contact</a></li>
              <li><span className="text-zinc-400">Manifesto — soon</span></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Get started</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li><Link to="/sign-up" className="hover:text-zinc-900">Create agency</Link></li>
              <li><Link to="/sign-in" className="hover:text-zinc-900">Log in</Link></li>
              <li><Link to="/select-agency" className="hover:text-zinc-900">Select agency</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
