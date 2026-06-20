"use client";

import { AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { percent, titleCase } from "@/lib/format";
import { useApi } from "@/lib/useApi";

type Entry = { id: number; holder: string; type: string; ownership_percent: number | null; shares: number | null; notes: string | null };

export default function CapTablePage() {
  const {data, loading} = useApi<Entry[]>("/companies/1/cap-table");
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Ownership" title="Cap table clarity" description="Current ownership records and dilution-model warnings."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading cap table…</div></AppLayout>;
  const founders = data.filter(i => i.holder.startsWith("Founder")).reduce((s,i)=>s+(i.ownership_percent||0),0);
  const pool = data.find(i => i.type === "option_pool")?.ownership_percent || 0;
  return <AppLayout><PageHeader eyebrow="Ownership & dilution" title="Cap table clarity" description="Current ownership is readable, but the unconverted SAFE needs a pro-forma view before investor diligence."/>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Stat label="Founder ownership" value={`${founders}%`}/><Stat label="Option pool" value={`${pool}%`}/><Stat label="Unmodeled instruments" value={String(data.filter(i=>i.ownership_percent===null).length)}/></div>
    <div className="table-wrap"><table><thead><tr><th>Holder</th><th>Security</th><th>Ownership</th><th>Shares</th><th>Notes</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td className="font-medium text-white">{item.holder}</td><td>{titleCase(item.type)}</td><td>{item.ownership_percent === null ? <span className="text-amber-300">Not modeled</span> : percent(item.ownership_percent/100)}</td><td>{item.shares?.toLocaleString() || "—"}</td><td className="text-slate-500">{item.notes || "—"}</td></tr>)}</tbody></table></div>
    <div className="mt-5 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={20}/><div><h2 className="font-semibold text-amber-100">SAFE conversion is not reflected</h2><p className="mt-2 text-sm leading-6 text-amber-100/60">Build a fully diluted, pro-forma cap table that shows the $500K SAFE conversion and proposed Seed round dilution.</p></div></div>
  </AppLayout>;
}
function Stat({label,value}:{label:string;value:string}) { return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>; }
