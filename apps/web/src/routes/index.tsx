import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { LogoLockup } from "@/components/mc/logo";
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
    <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border border-black/5 bg-white text-sm text-zinc-500 sm:min-h-[420px] sm:rounded-[24px] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
      Loading flight…
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-medium leading-tight tracking-wide text-zinc-600 shadow-sm sm:gap-2 sm:px-3 sm:py-1 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
      {children}
    </span>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">{children}</p>
  );
}

function Landing() {
  return (
    <div className="bg-[#FCFCF9] text-[#0b0b0f] selection:bg-[#89dceb]/30 dark:bg-[#09090b] dark:text-zinc-100">
      {/* system dark without toggle */}
      <style>{`@media (prefers-color-scheme: dark) { html { color-scheme: dark } }`}</style>

      {/* Header — raycast-like: thin, airy, nav center */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#FCFCF9]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#FCFCF9]/70 dark:border-white/10 dark:bg-[#09090b]/80 dark:supports-[backdrop-filter]:bg-[#09090b]/70">
        <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[56px] sm:gap-6 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <LogoLockup className="scale-[0.70] origin-left sm:scale-[0.78] [&_span]:!text-[#0b0b0f] dark:[&_span]:!text-white" />
          </Link>

          <nav className="hidden items-center gap-1 text-[13px] font-medium text-zinc-500 md:flex dark:text-zinc-400">
            <a href="#capabilities" className="rounded-full px-3 py-1.5 transition hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">Capabilities</a>
            <a href="#surfaces" className="rounded-full px-3 py-1.5 transition hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">Surfaces</a>
            <a href="#flight" className="rounded-full px-3 py-1.5 transition hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">Audit</a>
            <a href="#pricing" className="rounded-full px-3 py-1.5 transition hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">Pricing</a>
            <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="rounded-full px-3 py-1.5 transition hover:bg-black/[0.04] hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">GitHub</a>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <button className="hidden sm:inline-flex rounded-full px-4 py-2 text-[13px] font-medium text-zinc-600 transition hover:bg-black/[0.06] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white">
                  Log in
                </button>
              </SignInButton>
              <Link to="/sign-up" className="hidden sm:block">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b0f] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  Create agency <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                </span>
              </Link>
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <span className="inline-flex items-center rounded-full bg-[#0b0b0f] px-3.5 py-2 text-[13px] font-medium text-white sm:hidden dark:bg-white dark:text-zinc-900">Sign in</span>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link to="/app">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0b0f] px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-zinc-800 sm:px-4 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  Open Cockpit <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <span className="ml-1"><UserButton /></span>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero — centered like raycast */}
      <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pb-8 sm:pt-14 lg:px-8 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] sm:bg-[size:32px_32px] dark:opacity-30" />
          <div className="absolute left-1/2 top-[-120px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#89dceb]/20 via-[#cba6f7]/15 to-[#f2cdcd]/20 blur-[70px] sm:h-[560px] sm:w-[900px] sm:blur-[80px] dark:from-[#89dceb]/10 dark:via-[#cba6f7]/10 dark:to-[#f2cdcd]/10" />
        </div>

        <div className="mx-auto max-w-[1200px] text-center">
          <div className="flex justify-center px-2">
            <Pill>
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="hidden sm:inline">New: Local Agent + rendered crawl — zero per-page fees</span>
              <span className="sm:hidden">New: Local Agent · zero per-page fees</span>
              <span className="hidden items-center gap-1 text-zinc-400 sm:inline-flex">· <a href="#flight" className="underline-offset-2 hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">Take the flight</a></span>
            </Pill>
          </div>

          <h1 className="mx-auto mt-6 max-w-[780px] text-[32px] font-[700] leading-[0.95] tracking-[-0.04em] text-[#0b0b0f] sm:mt-8 sm:text-[56px] lg:text-[72px] dark:text-white">
            Your shortcut to
            <br />
            <span className="bg-gradient-to-r from-[#ff4d4d] via-[#ff8a5b] to-[#0ea5e9] bg-clip-text text-transparent">every client.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[560px] px-2 text-[15px] leading-6 text-zinc-500 sm:mt-6 sm:px-0 sm:text-[17px] dark:text-zinc-400">
            A collection of agency superpowers — audit, CRM, social, email, automations and a real client portal — inside one extendable cockpit.
          </p>

          <div className="mx-auto mt-6 flex max-w-[420px] flex-col items-stretch gap-3 px-2 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:px-0">
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/app">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b0b0f] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:bg-zinc-800 sm:w-auto sm:py-3 sm:text-[14px] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 cursor-pointer">
                  Create agency — free <ArrowRight className="h-4 w-4" />
                </span>
              </SignInButton>
              <Link to="/sign-in" className="w-full sm:w-auto">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3.5 text-[15px] font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:w-auto sm:py-3 sm:text-[14px] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  <Command className="h-4 w-4" /> Open cockpit
                </span>
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/app" className="w-full sm:w-auto">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b0b0f] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:bg-zinc-800 sm:w-auto sm:py-3 sm:text-[14px] dark:bg-white dark:text-zinc-900">
                  Open Cockpit <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Show>
          </div>
          <p className="mt-3 hidden text-xs text-zinc-400 sm:block dark:text-zinc-500">No credit card. Self Client auto-created on signup.</p>

          {/* Launcher mock — the raycast window */}
          <div className="relative mx-auto mt-8 max-w-[860px] sm:mt-12">
            <div className="relative overflow-hidden rounded-[16px] border border-black/10 bg-white shadow-[0_16px_32px_-12px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.03)] sm:rounded-[20px] sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#fafaf8] px-3 py-2.5 sm:px-4 sm:py-3 dark:border-white/10 dark:bg-zinc-900">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10 sm:h-3 sm:w-3 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] ring-1 ring-black/10 sm:h-3 sm:w-3 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c940] ring-1 ring-black/10 sm:h-3 sm:w-3 dark:ring-white/10" />
                <span className="ml-2 truncate text-xs font-medium text-zinc-400 dark:text-zinc-500">Mission Control — ⌘K</span>
                <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white sm:inline-flex dark:bg-white dark:text-zinc-900">Local Agent · live</span>
              </div>

              <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3 dark:border-white/10">
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                <input readOnly value="crawl acme — rendered, ignore robots off" className="min-w-0 flex-1 truncate bg-transparent text-[13px] font-medium text-zinc-700 placeholder:text-zinc-400 focus:outline-none sm:text-[14px] dark:text-zinc-200" />
                <span className="hidden shrink-0 items-center gap-1 rounded-md border border-black/10 bg-white px-1.5 py-1 text-[10px] font-medium text-zinc-500 sm:inline-flex dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">↵ run</span>
              </div>

              <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1.4fr_0.9fr]">
                <div className="divide-y divide-black/[0.05] text-left dark:divide-white/5">
                  {[
                    { icon: Globe, label: "Start Crawl Run", desc: "acme.example · Rendered · 2.4k URLs", hotkey: "↵", active: true },
                    { icon: Layers, label: "Open Issue Cluster", desc: "12× Missing canonical — /blog/*", hotkey: "⌘ ↵" },
                    { icon: UsersRound, label: "Find Contact", desc: "Maya Patel — Acme Co · Owner", hotkey: "⌘ C" },
                    { icon: Megaphone, label: "Schedule Social Post", desc: "Queue for approval — 2 wk look-ahead", hotkey: "⌘ S" },
                    { icon: Inbox, label: "Open Conversation", desc: "Re: Proposal — unread · SMS + Email", hotkey: "⌘ O" },
                  ].map((r) => (
                    <div key={r.label} className={`flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3 ${r.active ? "bg-[#f4f4f0] dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-white/5"}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${r.active ? "border-black/10 bg-white text-[#0b0b0f] dark:border-white/10 dark:bg-zinc-700 dark:text-white" : "border-black/5 bg-zinc-50 text-zinc-500 dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                        <r.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium leading-none text-zinc-900 dark:text-zinc-100">{r.label}</p>
                        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{r.desc}</p>
                      </div>
                      <span className="hidden shrink-0 rounded-md bg-white px-1.5 py-1 text-[10px] font-medium text-zinc-500 ring-1 ring-black/10 sm:inline-flex dark:bg-zinc-700 dark:text-zinc-300 dark:ring-white/10">{r.hotkey}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden border-l border-black/[0.06] bg-[#fafaf8] p-4 text-left sm:block dark:border-white/10 dark:bg-zinc-900/50">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Crawl preview</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">acme.example</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800">Rendered</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { k: "Pages", v: "2,431" },
                        { k: "Issues", v: "87" },
                        { k: "Health", v: "92%" },
                      ].map((s) => (
                        <div key={s.k} className="rounded-lg bg-zinc-50 px-2 py-2 ring-1 ring-black/5 dark:bg-zinc-700/50 dark:ring-white/5">
                          <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">{s.v}</p>
                          <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{s.k}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Streaming to Convex · live
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
                      <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#89dceb] to-[#f2cdcd]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">Agent runs on your metal. Artifacts stay local; findings stream to the Control Plane — no per-page billing.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-black/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10">⌘K — palette</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-black/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-white/10">/ — command</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] bg-[#fafaf8] px-3 py-2 text-[11px] text-zinc-500 sm:px-4 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
                <span className="hidden sm:inline">Press <kbd className="rounded border border-black/10 bg-white px-1 py-0.5 dark:border-white/10 dark:bg-zinc-800">↑↓</kbd> to navigate · <kbd className="rounded border border-black/10 bg-white px-1 py-0.5 dark:border-white/10 dark:bg-zinc-800">↵</kbd> to run</span>
                <span className="flex w-full items-center justify-center gap-1.5 sm:ml-auto sm:w-auto sm:justify-end"><Sparkles className="h-3 w-3 text-amber-500" /> Flat SaaS · Own the loop</span>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-x-4 -bottom-6 -z-10 h-32 bg-gradient-to-t from-[#89dceb]/15 via-[#f2cdcd]/10 to-transparent blur-2xl sm:-inset-x-8 sm:-bottom-10 sm:h-40 dark:from-[#89dceb]/10 dark:via-[#f2cdcd]/5" />
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-black/[0.06] bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-900 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Built for agencies who ship</p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-400 sm:gap-6 sm:text-sm">
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><span className="h-5 w-5 rounded-full bg-zinc-900 sm:h-6 sm:w-6 dark:bg-white" />Local SEO</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><span className="h-5 w-5 rounded-full bg-zinc-200 ring-1 ring-black/5 sm:h-6 sm:w-6 dark:bg-zinc-700 dark:ring-white/10" />Technical Audit</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><span className="h-5 w-5 rounded-lg bg-gradient-to-br from-sky-400 to-fuchsia-400 sm:h-6 sm:w-6" />Client Portal</span>
            <span className="hidden sm:inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400">+ CRM · Email · Social</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-zinc-500 lg:flex dark:text-zinc-400">
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-white dark:text-zinc-900">Flat pricing</span>
            <span>Starter · Pro · Enterprise</span>
          </div>
        </div>
      </section>

      {/* Bento */}
      <section id="capabilities" className="bg-[#FCFCF9] px-4 py-10 dark:bg-[#09090b] sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Capabilities</SectionEyebrow>
            <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#0b0b0f] sm:text-3xl lg:text-4xl dark:text-white">There&apos;s a cockpit for that.</h2>
            <p className="mx-auto mt-3 max-w-[560px] px-2 text-[13px] leading-6 text-zinc-500 sm:px-0 sm:text-sm dark:text-zinc-400">Use your favourite workflows without opening twelve tools. Audit, pipeline, inbox and calendar — one protocol.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Technical Audit", desc: "Rendered crawl, open issues, duplicate clusters & a11y — streamed live.", icon: Search, accent: "#89dceb" },
              { title: "Local Agent", desc: "Rust daemon on your metal. No per-page bills. Artifacts stay local.", icon: Bot, accent: "#74c7ec" },
              { title: "Dual CRM", desc: "Agency CRM + Client CRM. Same primitive, partitioned workspaces.", icon: UsersRound, accent: "#cba6f7" },
              { title: "Social Calendar", desc: "Schedule once, approve in the N-week look-ahead. No gatekeeping.", icon: Megaphone, accent: "#f2cdcd" },
              { title: "Email & Automations", desc: "Domains via Resend, templates, trigger→action — inline then Trigger.dev.", icon: Inbox, accent: "#a6e3a1" },
              { title: "Client Portal", desc: "ACL-gated, branded. Shared findings, graphs, approval calendar.", icon: LayoutGrid, accent: "#fab387" },
            ].map((c) => (
              <div key={c.title} className="group relative overflow-hidden rounded-[16px] border border-black/[0.07] bg-white p-5 shadow-sm transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 sm:rounded-[20px] sm:p-6 dark:border-white/10 dark:bg-zinc-900 dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-zinc-50 text-zinc-700 sm:h-10 sm:w-10 dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-300" style={{ boxShadow: `0 0 20px ${c.accent}30` }}>
                  <c.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold tracking-tight text-zinc-900 sm:mt-4 sm:text-[15px] dark:text-zinc-100">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-900 opacity-0 transition group-hover:opacity-100 sm:mt-4 dark:text-zinc-300">
                  Learn more <ChevronRight className="h-3 w-3" />
                </span>
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl" style={{ background: c.accent }} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Link to="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:w-auto sm:py-2 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Browse all capabilities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Speed */}
      <section className="border-y border-black/[0.06] bg-white px-4 py-8 dark:border-white/10 dark:bg-zinc-900 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-3">
          {[
            { k: "Fast.", v: "Rendered by default. Stream findings to Convex as they land — no poll.", icon: Zap },
            { k: "Ergonomic.", v: "⌘K everywhere. Sparse cockpit, progressive disclosure — not widget walls.", icon: Command },
            { k: "Reliable.", v: "Inline automations, then Trigger.dev retries. Publish failures auto-reschedule.", icon: ShieldCheck },
          ].map((s) => (
            <div key={s.k} className="flex gap-3 sm:block sm:text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 sm:mx-0">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{s.k}</p>
                <p className="mt-1 text-[13px] leading-5 text-zinc-500 sm:text-sm dark:text-zinc-400">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Surfaces */}
      <section id="surfaces" className="bg-[#f6f6f3] px-4 py-10 dark:bg-[#121214] sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionEyebrow>Surfaces</SectionEyebrow>
            <h2 className="mt-3 max-w-[520px] text-[26px] font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-900 sm:text-3xl lg:text-4xl dark:text-white">Web. Desktop. Terminal. Phone. Equal.</h2>
            <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-zinc-600 sm:mt-4 sm:text-sm dark:text-zinc-400">One sync fabric. TanStack Start + Clerk + Convex on the Control Plane. Electron + Effect hosts the Agent. TUI for the shell-dwellers. No second-class viewers.</p>
            <ul className="mt-5 space-y-2.5 text-[13px] text-zinc-600 sm:mt-6 sm:space-y-3 sm:text-sm dark:text-zinc-400">
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-white" />Desktop installs & repairs the daemon — not a child process.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-white" />Agent Token in OS keychain. Sync over WebSocket, jobs & presence.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-white" />Mobile & TUI talk the same protocol — same Audit Loop.</li>
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              <Link to="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-black sm:w-auto sm:py-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">Open app <ArrowRight className="h-4 w-4" /></Link>
              <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-zinc-700 sm:w-auto sm:py-2 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">GitHub <ChevronRight className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[16px] border border-black/10 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.10)] sm:rounded-[20px] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Web — Cockpit", sub: "Audit loop · live" },
                { label: "Desktop — Agent", sub: "LaunchAgent · systemd" },
                { label: "TUI — Ops", sub: "Keyboard-first" },
                { label: "Mobile — Triage", sub: "On-call" },
              ].map((t) => (
                <div key={t.label} className="rounded-[12px] border border-black/5 bg-[#fafaf8] p-3 sm:rounded-[14px] sm:p-4 dark:border-white/5 dark:bg-zinc-800">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.sub}</p>
                  <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-zinc-100 to-white ring-1 ring-black/5 sm:h-20 dark:from-zinc-700 dark:to-zinc-800 dark:ring-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flight */}
      <section id="flight" className="bg-[#FCFCF9] px-4 py-10 dark:bg-[#09090b] sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Flight</SectionEyebrow>
            <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-3xl lg:text-4xl dark:text-white">Scroll to fly the agency.</h2>
            <p className="mt-3 px-2 text-[13px] leading-6 text-zinc-500 sm:px-0 sm:text-sm dark:text-zinc-400">Five stations — Command, Agent, CRM, Surfaces, Portal — pinned and scrubbed with GSAP. Reduced-motion falls back to a calm list.</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-[16px] border border-black/10 bg-[#11111b] shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:mt-8 sm:rounded-[24px] sm:shadow-[0_24px_64px_rgba(0,0,0,0.18)] dark:border-white/10">
            <ClientOnly fallback={<FlightPlaceholder />}>
              <Suspense fallback={<FlightPlaceholder />}>
                <WorldStage />
              </Suspense>
            </ClientOnly>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white px-4 py-10 dark:bg-zinc-900 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionEyebrow>Pricing</SectionEyebrow>
              <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-3xl dark:text-white">Stop renting crawlers. Own the loop.</h2>
              <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-zinc-600 sm:text-sm dark:text-zinc-400">Screaming Frog depth. Sitebulb prioritisation. Client-ready portal. One flat plan — Starter, Pro, or Enterprise. No per-page meter.</p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { name: "Starter", price: "$49", note: "per month" },
                  { name: "Pro", price: "$149", note: "per month", featured: true },
                  { name: "Enterprise", price: "Talk", note: "to us" },
                ].map((p) => (
                  <div key={p.name} className={`rounded-2xl border p-4 text-center ${p.featured ? "border-zinc-900 bg-zinc-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-zinc-900" : "border-black/10 bg-white dark:border-white/10 dark:bg-zinc-800"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest ${p.featured ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}>{p.name}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">{p.price}</p>
                    <p className={`text-xs ${p.featured ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}>{p.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal" fallbackRedirectUrl="/app">
                    <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white sm:w-auto sm:py-2.5 dark:bg-white dark:text-zinc-900">Start free <ArrowRight className="h-4 w-4" /></span>
                  </SignInButton>
                  <Link to="/portal" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-zinc-700 sm:w-auto sm:py-2.5 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">Client portal preview</Link>
                </Show>
                <Show when="signed-in">
                  <Link to="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white sm:w-auto sm:py-2.5 dark:bg-white dark:text-zinc-900">Mission Control <ArrowRight className="h-4 w-4" /></Link>
                </Show>
              </div>
            </div>

            <div className="rounded-[16px] border border-black/5 bg-[#f6f6f3] p-4 sm:rounded-[20px] sm:p-6 dark:border-white/5 dark:bg-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Loved by operators</p>
              <div className="mt-4 space-y-3 sm:space-y-4">
                {[
                  { q: "Finally a crawler we own. The portal alone killed our PDF busywork.", a: "Agency Owner · 32 locations" },
                  { q: "The dual CRM is the unlock — same tool for us and clients, no sync hell.", a: "Ops Lead · Multi-tenant" },
                  { q: "TUI + ⌘K. I live in there. Feels like Raycast for local SEO.", a: "Technical SEO · Power user" },
                ].map((t) => (
                  <div key={t.q} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900">
                    <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">“{t.q}”</p>
                    <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">— {t.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-y border-black/[0.06] bg-[#f6f6f3] px-4 py-8 dark:border-white/10 dark:bg-zinc-900 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-2xl lg:text-3xl dark:text-white">Take the short way.</h2>
            <p className="mt-2 text-[13px] text-zinc-500 sm:text-sm dark:text-zinc-400">Download for your OS — or open the cockpit in the browser. Same fabric.</p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Show when="signed-out">
              <Link to="/sign-up" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Create agency <ArrowRight className="h-4 w-4" />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link to="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black sm:w-auto dark:bg-white dark:text-zinc-900">
                Open Cockpit <ArrowRight className="h-4 w-4" />
              </Link>
            </Show>
            <a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white px-4 py-8 dark:bg-zinc-900 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-6 text-sm sm:gap-8 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <LogoLockup className="scale-[0.68] origin-left sm:scale-[0.72] [&_span]:!text-zinc-900 dark:[&_span]:!text-white" />
            <p className="mt-3 max-w-[220px] text-xs leading-5 text-zinc-500 dark:text-zinc-400">Mission Control OS — the agency operating system. Audit, CRM, portal & multi-surface ops.</p>
            <p className="mt-4 text-xs text-zinc-400">© 2026 Mission Control</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">Product</p>
            <ul className="mt-3 space-y-2 text-zinc-500 dark:text-zinc-400">
              <li><a href="#capabilities" className="hover:text-zinc-900 dark:hover:text-white">Capabilities</a></li>
              <li><a href="#surfaces" className="hover:text-zinc-900 dark:hover:text-white">Surfaces</a></li>
              <li><a href="#flight" className="hover:text-zinc-900 dark:hover:text-white">Audit Flight</a></li>
              <li><Link to="/portal" className="hover:text-zinc-900 dark:hover:text-white">Client Portal</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">Platform</p>
            <ul className="mt-3 space-y-2 text-zinc-500 dark:text-zinc-400">
              <li><Link to="/app" className="hover:text-zinc-900 dark:hover:text-white">Cockpit</Link></li>
              <li><a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white">Desktop Agent</a></li>
              <li><span className="text-zinc-400">TUI · Mobile</span></li>
              <li><a href="https://github.com/michaelmonetized/mission-control-os" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white">GitHub</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">Company</p>
            <ul className="mt-3 space-y-2 text-zinc-500 dark:text-zinc-400">
              <li><Link to="/app/settings" className="hover:text-zinc-900 dark:hover:text-white">Pricing</Link></li>
              <li><a href="mailto:hello@mission-control.os" className="hover:text-zinc-900 dark:hover:text-white">Contact</a></li>
              <li><span className="text-zinc-400">Manifesto — soon</span></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">Get started</p>
            <ul className="mt-3 space-y-2 text-zinc-500 dark:text-zinc-400">
              <li><Link to="/sign-up" className="hover:text-zinc-900 dark:hover:text-white">Create agency</Link></li>
              <li><Link to="/sign-in" className="hover:text-zinc-900 dark:hover:text-white">Log in</Link></li>
              <li><Link to="/select-agency" className="hover:text-zinc-900 dark:hover:text-white">Select agency</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
