"use client";

import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/Badges";
import { DataRoomItem } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function DataRoomPage() {
  const { data, loading } = useApi<DataRoomItem[]>("/companies/1/data-room");
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Evidence" title="Data-room completeness" description="Required Seed diligence artifacts, grouped by operating category."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading data room…</div></AppLayout>;
  const categories = Array.from(new Set(data.map(item => item.category)));
  const present = data.filter(item => item.status === "present").length;
  return <AppLayout><PageHeader eyebrow="Evidence inventory" title="Data-room completeness" description={`${present} of ${data.length} required items are present. Missing artifacts directly feed the readiness score, risk flags, and action plan.`}/>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Summary label="Present" value={present} tone="text-emerald-300"/><Summary label="Missing" value={data.filter(i => i.status === "missing").length} tone="text-rose-300"/><Summary label="Needs review" value={data.filter(i => i.status === "needs_review").length} tone="text-amber-200"/></div>
    <div className="space-y-6">{categories.map(category => <section key={category}><h2 className="mb-3 text-sm font-semibold text-slate-300">{category}</h2><div className="table-wrap"><table><thead><tr><th>Required document</th><th>Status</th><th>Readiness treatment</th></tr></thead><tbody>{data.filter(item => item.category === category).map(item => <tr key={item.key}><td className="font-medium text-white">{item.name}</td><td><StatusBadge value={item.status}/></td><td className="text-slate-500">{item.status === "present" ? "Full credit" : item.status === "needs_review" ? "Half credit" : "No credit until uploaded"}</td></tr>)}</tbody></table></div></section>)}</div>
  </AppLayout>;
}

function Summary({label,value,tone}:{label:string;value:number;tone:string}) { return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p></div>; }
