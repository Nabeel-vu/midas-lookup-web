/* Style direction: Tactical Signal Console — dark gaming intelligence, signal violet, emerald confirmation, telemetry rails, and restrained scanline motifs. */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  DatabaseZap,
  Fingerprint,
  Gamepad2,
  Globe2,
  Loader2,
  LockKeyhole,
  Search,
  ShieldCheck,
  Signal,
  UserRound,
  Wifi,
  XCircle,
} from "lucide-react";

const LOOKUP_ENDPOINT = "/api/query";
const CACHE_PREFIX = "midaslookup:player:";
const CACHE_TTL_MS = 5 * 60 * 1000;

type LookupResult = {
  success: boolean;
  player_id: string;
  name?: string;
  openid?: string;
  zoneid?: string;
  error?: string;
  ret?: number;
};

function readCachedResult(playerId: string): LookupResult | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${playerId}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; result: LookupResult };
    if (Date.now() - cached.savedAt > CACHE_TTL_MS || !cached.result?.success) {
      localStorage.removeItem(`${CACHE_PREFIX}${playerId}`);
      return null;
    }
    return cached.result;
  } catch {
    return null;
  }
}

function writeCachedResult(playerId: string, result: LookupResult) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${playerId}`, JSON.stringify({ savedAt: Date.now(), result }));
  } catch {
    // Storage may be unavailable in private browsing; a live lookup still works.
  }
}

export default function Home() {
  const [playerId, setPlayerId] = useState("5333302466");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState(false);

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const normalizedId = playerId.trim();
    setError(null);
    setResult(null);
    setCacheHit(false);

    if (!/^\d{6,20}$/.test(normalizedId)) {
      setError("Enter a valid numeric PUBG Mobile Player ID.");
      return;
    }

    const cachedResult = readCachedResult(normalizedId);
    if (cachedResult) {
      setResult(cachedResult);
      setCacheHit(true);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch(`${LOOKUP_ENDPOINT}?id=${encodeURIComponent(normalizedId)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const data = (await response.json()) as LookupResult & { detail?: string };

      if (!response.ok) throw new Error(data.detail || data.error || "Server error occurred.");
      if (!data.success) throw new Error(data.error || "Player name could not be found.");

      writeCachedResult(normalizedId, data);
      setResult(data);
    } catch (caught: unknown) {
      const message = caught instanceof DOMException && caught.name === "AbortError"
        ? "The lookup timed out. Please try again."
        : caught instanceof Error
          ? caught.message
          : "Lookup failed. Please try again.";
      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#070a16] text-slate-100 selection:bg-[#7c5cff] selection:text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute inset-0 bg-signal-grid" />
        <div className="absolute -left-40 top-28 h-[26rem] w-[26rem] rounded-full bg-[#392a95]/20 blur-[110px]" />
        <div className="absolute -right-40 bottom-10 h-[24rem] w-[24rem] rounded-full bg-[#143f70]/20 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.07] bg-[#070a16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[0.85rem] border border-[#a697ff]/40 bg-[#7c5cff] shadow-[0_0_32px_rgba(124,92,255,0.28)]">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#8dffba] shadow-[0_0_10px_#8dffba]" />
            </div>
            <div>
              <div className="font-display text-[1.35rem] font-bold leading-none tracking-[-0.03em] text-white">MidasLookup</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d8bff]">
                <span>Identity gateway</span>
                <span className="h-1 w-1 rounded-full bg-[#7c5cff]" />
                <span>PUBGM</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 sm:flex">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
              <Globe2 className="h-3.5 w-3.5 text-[#7c5cff]" />
              <span>Hosted edge route</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_9px_#86efac]" />
              <span>Function ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.84fr_1.16fr] lg:gap-20 lg:py-20">
        <section className="max-w-xl">
          <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a697ff]">
            <span className="h-px w-10 bg-[#7c5cff]" />
            <span>Player identity / 001</span>
          </div>
          <h1 className="font-display max-w-2xl text-[3.6rem] font-extrabold uppercase leading-[0.88] tracking-[-0.045em] text-white sm:text-[5.7rem] lg:text-[6.4rem]">
            Verify the
            <span className="block text-[#9c8cff]">signal.</span>
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-7 text-slate-400">
            Resolve a PUBG Mobile Player ID through the hosted lookup gateway and receive a confirmed in-game identity in one clean response.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08]">
            {[
              { label: "Transport", value: "Request-based", icon: Signal },
              { label: "Execution", value: "Server-side", icon: LockKeyhole },
              { label: "Response", value: "Normalized JSON", icon: Code2 },
              { label: "Cache", value: "5 minute local", icon: DatabaseZap },
            ].map(({ label, value, icon: Icon }, index) => (
              <div key={label} className={`bg-[#0b1020]/90 p-4 ${index % 2 === 0 ? "border-r border-white/[0.06]" : ""}`}>
                <Icon className="mb-4 h-4 w-4 text-[#7c5cff]" />
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative w-full max-w-2xl justify-self-end">
          <div className="absolute -inset-6 bg-[#392a95]/10 blur-3xl" />
          <Card className="relative overflow-hidden rounded-none border border-white/[0.11] bg-[#0b1020]/95 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="scanline absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9d8bff] to-transparent opacity-80" />
            <CardHeader className="border-b border-white/[0.07] px-6 pb-6 pt-7 sm:px-8">
              <div className="mb-6 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-[#7c5cff]" /> Lookup console</span>
                <span className="font-mono text-[#64708e]">SECURE / 02</span>
              </div>
              <CardTitle className="font-display text-3xl font-bold uppercase tracking-[-0.02em] text-white">Player verification</CardTitle>
              <CardDescription className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Enter a numeric Player ID. The hosted function handles the upstream request; your browser only receives the final identity response.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLookup}>
              <CardContent className="space-y-7 px-6 py-7 sm:px-8 sm:py-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="player-id" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Player ID</label>
                    <span className="font-mono text-[10px] text-slate-600">6–20 digits</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Fingerprint className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7c5cff]" />
                      <Input
                        id="player-id"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="5333302466"
                        value={playerId}
                        onChange={(event) => setPlayerId(event.target.value.replace(/[^\d]/g, ""))}
                        className="h-14 rounded-none border-white/[0.11] bg-[#070a16] pl-12 font-mono text-base tracking-[0.06em] text-white placeholder:text-slate-700 focus-visible:border-[#7c5cff] focus-visible:ring-1 focus-visible:ring-[#7c5cff]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-14 rounded-none border border-[#a697ff]/30 bg-[#7c5cff] px-7 font-semibold uppercase tracking-[0.1em] text-white shadow-[0_0_28px_rgba(124,92,255,0.22)] transition-all duration-200 hover:bg-[#8d72ff] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                      {loading ? "Resolving" : "Lookup"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-y border-white/[0.06] py-4 text-[11px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7c5cff] shadow-[0_0_8px_#7c5cff]" />
                  <span>Request route</span>
                  <code className="font-mono text-[#8e80d9]">/api/query</code>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-700" />
                </div>

                {error && (
                  <div className="flex items-start gap-3 border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-300">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div><span className="mb-1 block font-semibold uppercase tracking-[0.1em]">Lookup interrupted</span>{error}</div>
                  </div>
                )}

                {result && (
                  <div className="border border-emerald-300/20 bg-emerald-300/[0.06] p-5 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:p-6">
                    <div className="mb-5 flex items-center justify-between border-b border-emerald-300/15 pb-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                        <CheckCircle2 className="h-5 w-5" /> Identity confirmed
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-emerald-200/70">{cacheHit ? "Local cache" : "Live route"}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                      <div className="border border-white/[0.07] bg-[#070a16]/70 p-4 sm:col-span-2">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">In-game name</div>
                        <div className="break-words text-2xl font-bold tracking-[-0.02em] text-white">{result.name}</div>
                      </div>
                      <div className="border border-white/[0.07] bg-[#070a16]/50 p-4">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Player ID</div>
                        <div className="font-mono text-sm text-slate-200">{result.player_id}</div>
                      </div>
                      <div className="border border-white/[0.07] bg-[#070a16]/50 p-4">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Zone</div>
                        <div className="font-mono text-sm text-slate-200">{result.zoneid || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </form>

            <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-[#070a16]/60 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <span className="flex items-center gap-2"><Gamepad2 className="h-3.5 w-3.5 text-[#7c5cff]" /> PUBG Mobile player identity</span>
              <span className="flex items-center gap-2"><Wifi className="h-3.5 w-3.5 text-emerald-400" /> Hosted function ready</span>
            </div>
          </Card>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[#070a16]/80 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>MidasLookup / identity gateway</span>
          <span className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5" /> One ID in. Confirmed identity out.</span>
        </div>
      </footer>
    </div>
  );
}
