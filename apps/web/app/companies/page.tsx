"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Loader2, Pencil, Play, Plus } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ReviewBadge, SeverityBadge } from "@/components/Badges";
import { diligenceReportUrl, runAnalysis } from "@/lib/api";
import { CompanySummary } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function CompaniesPage() {
  const { data, loading, refresh } = useApi<CompanySummary[]>("/companies/summary");
  const [running, setRunning] = useState<number | null>(null);
  const analyze = async (id: number) => {
    setRunning(id);
    try { await runAnalysis(id); await refresh(); } finally { setRunning(null); }
  };
  return <AppLayout><PageHeader eyebrow="Operator console" title="Operator portfolio" description="Review founder-provided evidence across synthetic demos and operator-created companies. Generated analysis is a draft for operator review — not legal, tax, investment, or accounting advice." action={<Link href="/companies/new" className="button"><Plus size={16}/> Intake company</Link>}/>
    {loading && <p className="muted">Loading companies…</p>}
    {!loading && !data?.length && <div className="card p-10 text-center"><h2 className="text-xl font-semibold">No companies yet</h2><p className="mt-2 text-sm text-slate-400">Seed demo data or create a company manually.</p><div className="mt-5 flex justify-center gap-3"><Link href="/demo" className="button-secondary">Seed demos</Link><Link href="/companies/new" className="button">Create company</Link></div></div>}
    {!!data?.length && <div className="table-wrap overflow-x-auto"><table><thead><tr><th>Company</th><th>Stage</th><th>Industry</th><th>Score</th><th>Status</th><th>Top risk</th><th>Review status</th><th>Actions</th></tr></thead><tbody>{data.map(company => <tr key={company.id}>
      <td><Link href={`/companies/${company.id}/dashboard`} className="font-semibold text-white hover:text-mint">{company.name}</Link><span className="ml-2 text-[10px] uppercase tracking-wider text-slate-600">{company.is_demo ? "Demo" : "Operator"}</span></td>
      <td>{company.stage}</td><td>{company.industry}</td>
      <td className="font-semibold text-white">{company.score === null ? "—" : company.score.toFixed(1)}</td>
      <td><span className="whitespace-nowrap rounded-full bg-white/5 px-2.5 py-1 text-xs">{company.tier}</span></td>
      <td><SeverityBadge value={company.risk_count > 5 ? "High" : company.risk_count ? "Medium" : "Low"}/> <span className="ml-2">{company.top_risk}</span></td>
      <td><ReviewBadge value={company.review_status}/></td>
      <td><div className="flex min-w-max gap-2"><Link href={`/companies/${company.id}/dashboard`} className="button-secondary !px-3 !py-2">View</Link><button onClick={() => analyze(company.id)} className="button-secondary !px-3 !py-2" disabled={running === company.id}>{running === company.id ? <Loader2 size={14} className="animate-spin"/> : <Play size={14}/>}</button>{company.score!==null&&<a href={diligenceReportUrl(company.id)} className="button-secondary !px-3 !py-2" title="Export report"><Download size={14}/></a>}<Link href={`/companies/${company.id}/edit-data`} className="button-secondary !px-3 !py-2" title="Edit data"><Pencil size={14}/></Link></div></td>
    </tr>)}</tbody></table></div>}
  </AppLayout>;
}
