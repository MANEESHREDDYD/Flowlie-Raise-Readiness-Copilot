"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Loader2, Play, RotateCcw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { api, runDemoPipeline } from "@/lib/api";
import { useApi } from "@/lib/useApi";

type Status = { seeded: boolean; company_id: number | null; readiness_generated: boolean; risks_generated: boolean; questions_generated: boolean; action_plan_generated: boolean };

export default function DemoPage() {
  const { data, refresh } = useApi<Status>("/demo/status");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const run = async () => {
    setRunning(true); setMessage("Loading synthetic company records…");
    try { await runDemoPipeline(); setMessage("AtlasAI is analyzed and ready."); await refresh(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Demo failed"); }
    finally { setRunning(false); }
  };
  const reset = async () => { setRunning(true); await api("/demo/reset", {method: "POST"}); setMessage("Demo reset."); await refresh(); setRunning(false); };
  const steps = [
    ["Demo data seeded", data?.seeded], ["Readiness analyzed", data?.readiness_generated],
    ["Risks generated", data?.risks_generated], ["Investor Q&A generated", data?.questions_generated],
    ["Action plan generated", data?.action_plan_generated],
  ] as const;
  return <AppLayout><PageHeader eyebrow="One-click product tour" title="AtlasAI demo controls" description="Seed a synthetic Seed-stage company and run every deterministic analysis engine in one local workflow."/>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="card p-7">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-violet/15 text-violet"><Sparkles/></span><div><h2 className="text-xl font-semibold">Run complete demo</h2><p className="mt-1 text-sm text-slate-400">Usually completes in under a second after the API starts.</p></div></div>
        <div className="mt-7 flex flex-wrap gap-3"><button className="button" onClick={run} disabled={running}>{running ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>} Seed & analyze AtlasAI</button><button className="button-secondary" onClick={reset} disabled={running}><RotateCcw size={16}/> Reset</button></div>
        {message && <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{message}</p>}
        {data?.action_plan_generated && <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mint">Open analyzed dashboard <ArrowRight size={15}/></Link>}
      </section>
      <section className="card p-7"><p className="eyebrow">Pipeline status</p><div className="mt-5 space-y-3">{steps.map(([label, complete], index) => <div key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3"><span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${complete ? "bg-mint text-slate-950" : "bg-white/5 text-slate-500"}`}>{complete ? <Check size={14}/> : index + 1}</span><span className={complete ? "text-white" : "text-slate-500"}>{label}</span></div>)}</div></section>
    </div>
  </AppLayout>;
}
