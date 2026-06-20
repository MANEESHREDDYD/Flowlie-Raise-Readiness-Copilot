"use client";

import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { RiskCard } from "@/components/RiskCard";
import { Risk } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function RisksPage() {
  const {data, loading} = useApi<Risk[]>("/companies/1/risks");
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Diligence triage" title="Risk flags" description="Evidence-based concerns and founder-friendly remediation guidance."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading risks…</div></AppLayout>;
  const order = ["Critical","High","Medium","Low"];
  return <AppLayout><PageHeader eyebrow="Deterministic risk engine" title="Potential diligence concerns" description={`${data.length} rule-based flags generated from AtlasAI’s synthetic financial, HR, compliance, ownership, pipeline, and meeting evidence.`}/>
    <div className="space-y-8">{order.map(severity => {
      const items = data.filter(risk => risk.severity === severity);
      if (!items.length) return null;
      return <section key={severity}><div className="mb-4 flex items-center gap-3"><h2 className="text-lg font-semibold">{severity}</h2><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-500">{items.length}</span></div><div className="grid gap-4">{items.map(risk => <RiskCard risk={risk} key={risk.id}/>)}</div></section>;
    })}</div>
  </AppLayout>;
}
