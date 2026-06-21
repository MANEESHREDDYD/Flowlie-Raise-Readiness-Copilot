"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, Loader2, Play, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";

type Status = {
  seeded: boolean;
  seeded_count: number;
  company_id: number | null;
  company_names: string[];
};

type Notice = { tone: "success" | "error"; text: string } | null;

export default function DemoPage() {
  const { data, loading, error, refresh } = useApi<Status>("/demo/status");
  const [running, setRunning] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const call = async (path: string, label: string) => {
    setRunning(path);
    setNotice(null);
    try {
      await api(path, { method: "POST" });
      await refresh();
      setNotice({ tone: "success", text: label });
    } catch (requestError) {
      setNotice({
        tone: "error",
        text: requestError instanceof Error ? requestError.message : "Demo action failed.",
      });
    } finally {
      setRunning("");
    }
  };

  const unavailable = Boolean(error);

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Synthetic portfolio controls"
        title="Demo data"
        description="Seed AtlasAI alone or load five distinct startups with generated scores, risks, Q&A, and action plans."
        action={<Link href="/companies" className="button-secondary"><Building2 size={16}/> Open portfolio</Link>}
      />

      {unavailable && (
        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={20}/>
            <div>
              <h2 className="font-semibold text-amber-100">Demo service is not connected</h2>
              <p className="mt-2 text-sm leading-6 text-amber-100/70">
                The Next.js interface is online, but FastAPI is not reachable. From the repository root, run
                <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5">npm run dev</code>
                to start both services.
              </p>
              <button className="button-secondary mt-4" onClick={() => refresh()}>
                <RefreshCw size={15}/> Retry API connection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="card p-7">
          <div className="flex gap-3">
            <span className="rounded-xl bg-violet/15 p-3 text-violet"><Sparkles/></span>
            <div>
              <h2 className="text-xl font-semibold">Choose a demo mode</h2>
              <p className="mt-1 text-sm text-slate-400">Seeding runs the complete deterministic analysis pipeline.</p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="button" disabled={Boolean(running) || unavailable} onClick={() => call("/demo/seed-atlasai", "AtlasAI is ready.")}>
              {running === "/demo/seed-atlasai" ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
              Seed AtlasAI only
            </button>
            <button className="button-secondary" disabled={Boolean(running) || unavailable} onClick={() => call("/demo/seed-all", "All five demo companies are ready.")}>
              {running === "/demo/seed-all" ? <Loader2 className="animate-spin" size={16}/> : <Building2 size={16}/>}
              Seed all companies
            </button>
            <button className="button-secondary" disabled={Boolean(running) || unavailable} onClick={() => call("/demo/reset", "Synthetic demo companies reset; user companies were preserved.")}>
              {running === "/demo/reset" ? <Loader2 className="animate-spin" size={16}/> : <RotateCcw size={16}/>}
              Reset demo data
            </button>
          </div>
          {notice && (
            <div className={`mt-5 flex gap-3 rounded-xl p-4 text-sm ${notice.tone === "success" ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
              {notice.tone === "success" ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>}
              <span>{notice.text}</span>
            </div>
          )}
        </section>

        <section className="card p-7">
          <p className="eyebrow">Current demo state</p>
          <p className="mt-3 text-4xl font-semibold">{loading ? "…" : data?.seeded_count || 0}</p>
          <p className="text-sm text-slate-500">synthetic companies seeded</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {data?.company_names?.map(name => <span className="rounded-full bg-white/5 px-3 py-1 text-xs" key={name}>{name}</span>)}
          </div>
          {data?.seeded && <Link href="/companies" className="mt-6 inline-flex text-sm font-semibold text-mint">View company portfolio →</Link>}
        </section>
      </div>
    </AppLayout>
  );
}
