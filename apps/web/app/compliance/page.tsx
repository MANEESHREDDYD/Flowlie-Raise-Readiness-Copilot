"use client";

import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/Badges";
import { useApi } from "@/lib/useApi";

type Item = { id: number; item: string; status: string; last_updated: string | null; owner: string };

export default function CompliancePage() {
  const {data, loading} = useApi<Item[]>("/companies/1/compliance");
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Operations" title="Compliance & HR" description="Diligence-oriented checklist; not a legal conclusion."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading checklist…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Potential diligence concerns" title="Compliance & HR review" description="A practical evidence checklist for founder preparation. Statuses indicate what is present, missing, or needs review—not legal compliance."/>
    <div className="table-wrap"><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Last updated</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td className="font-medium text-white">{item.item}</td><td><StatusBadge value={item.status}/></td><td>{item.owner}</td><td className="text-slate-500">{item.last_updated || "No evidence date"}</td></tr>)}</tbody></table></div>
    <p className="mt-4 text-xs leading-5 text-slate-600">Prototype output only. Founder should coordinate filings, valuations, and legal documents with qualified advisers.</p>
  </AppLayout>;
}
