import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/mc/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/mc/card";
import { Input } from "@/components/mc/input";
import { Badge } from "@/components/mc/badge";
import { useIsAgencyAdmin } from "@/lib/auth-guards";
import { cn } from "cnfast";

export const Route = createFileRoute("/app/connections")({
  component: ConnectionsPage,
});

/** Supported social / ads providers (product surface — OAuth later). */
const PROVIDERS = [
  { id: "instagram", label: "Instagram", group: "Social" },
  { id: "facebook", label: "Facebook", group: "Social" },
  { id: "x", label: "X (Twitter)", group: "Social" },
  { id: "linkedin", label: "LinkedIn", group: "Social" },
  { id: "google_business", label: "Google Business Profile", group: "Local" },
  { id: "youtube", label: "YouTube", group: "Social" },
  { id: "tiktok", label: "TikTok", group: "Social" },
  { id: "pinterest", label: "Pinterest", group: "Social" },
  { id: "threads", label: "Threads", group: "Social" },
  { id: "meta_ads", label: "Meta Ads", group: "Ads" },
  { id: "google_ads", label: "Google Ads", group: "Ads" },
  { id: "linkedin_ads", label: "LinkedIn Ads", group: "Ads" },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

function labelFor(id: string) {
  return PROVIDERS.find((p) => p.id === id)?.label ?? id;
}

function ConnectionsPage() {
  const isAdmin = useIsAgencyAdmin();
  const clients = useQuery(api.clients.list, {});
  const accounts = useQuery(api.connections.list, {});
  const connect = useMutation(api.connections.connect);
  const disconnect = useMutation(api.connections.disconnect);
  const [provider, setProvider] = useState<ProviderId>("instagram");
  const [ownerKind, setOwnerKind] = useState<"agency" | "client">("agency");
  const [clientId, setClientId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const connectedByProvider = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of accounts ?? []) {
      map.set(a.provider, (map.get(a.provider) ?? 0) + 1);
    }
    return map;
  }, [accounts]);

  async function save() {
    if (!externalId.trim()) return;
    setBusy(true);
    setNote(null);
    try {
      await connect({
        provider,
        ownerKind,
        clientId: ownerKind === "client" ? (clientId as Id<"clients">) : undefined,
        externalId: externalId.trim(),
      });
      setExternalId("");
      setNote(`Connected ${labelFor(provider)}`);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setBusy(false);
    }
  }

  const groups = useMemo(() => {
    const g = new Map<string, typeof PROVIDERS[number][]>();
    for (const p of PROVIDERS) {
      const list = g.get(p.group) ?? [];
      list.push(p);
      g.set(p.group, list);
    }
    return [...g.entries()];
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Connected accounts</h1>
        <p className="mt-1 max-w-[40rem] text-sm text-[var(--color-mocha-subtext0)]">
          Link social and ad accounts for the agency or a client. Prefer client-owned brand channels
          when they can complete OAuth.
        </p>
      </div>

      {groups.map(([group, items]) => (
        <div key={group} className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-mocha-subtext0)]">
            {group}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
              const n = connectedByProvider.get(p.id) ?? 0;
              const selected = provider === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-[var(--color-brand-sky)] bg-[color-mix(in_oklab,var(--color-brand-sky)_10%,transparent)]"
                      : "border-[var(--color-mocha-surface1)] bg-[var(--color-mocha-mantle)] hover:border-[var(--color-mocha-surface2)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--color-mocha-text)]">
                      {p.label}
                    </span>
                    {n > 0 ? (
                      <Badge variant="secondary">{n} linked</Badge>
                    ) : (
                      <span className="text-[10px] text-[var(--color-mocha-overlay0)]">Not linked</span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-[var(--color-mocha-subtext0)]">
                    {p.id}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Connect {labelFor(provider)}</CardTitle>
          <CardDescription>
            Save an external account id or handle for now. Full OAuth per provider comes next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <select
            className="w-full rounded border border-[var(--color-mocha-surface1)] bg-[var(--color-mocha-surface0)] px-3 py-2 text-sm"
            value={ownerKind}
            onChange={(e) => setOwnerKind(e.target.value as "agency" | "client")}
          >
            <option value="agency">Connect as agency</option>
            <option value="client">Connect as client</option>
          </select>
          {ownerKind === "client" ? (
            <select
              className="w-full rounded border border-[var(--color-mocha-surface1)] bg-[var(--color-mocha-surface0)] px-3 py-2 text-sm"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Select client</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : null}
          <Input
            placeholder="External account id / handle"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
          />
          <Button
            disabled={
              busy || !isAdmin || !externalId.trim() || (ownerKind === "client" && !clientId)
            }
            onClick={() => void save()}
          >
            {busy ? "Saving…" : `Save ${labelFor(provider)}`}
          </Button>
          {note ? <p className="text-xs text-[var(--color-brand-sky)]">{note}</p> : null}
          {!isAdmin ? (
            <p className="text-xs text-[var(--color-mocha-subtext0)]">Admin role required to connect.</p>
          ) : null}
        </CardContent>
      </Card>

      {(accounts ?? []).length > 0 ? (
        <ul className="space-y-2">
          {(accounts ?? []).map((a) => (
            <li
              key={a.id}
              className="mc-glass flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5 text-sm"
            >
              <span>
                <span className="font-medium">{labelFor(a.provider)}</span>
                <span className="text-[var(--color-mocha-subtext0)]">
                  {" "}
                  · {a.ownerKind} · {a.externalId}
                </span>
              </span>
              {isAdmin ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void disconnect({ accountId: a.id as Id<"connectedAccounts"> })
                  }
                >
                  Disconnect
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
