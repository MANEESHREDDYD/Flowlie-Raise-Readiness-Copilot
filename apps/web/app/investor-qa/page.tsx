"use client";

import { BookOpen, FileQuestion } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Question } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function InvestorQaPage() {
  const {data, loading} = useApi<Question[]>("/companies/1/investor-qa");
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Founder preparation" title="Investor diligence Q&A" description="Template-based answers grounded in named source evidence."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading Q&A…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Source-backed answer drafts" title="Investor diligence Q&A" description="Every answer is generated from available evidence and explicitly calls out what is still missing. These are preparation prompts, not legal or investment advice."/>
    <div className="space-y-4">{data.map((item,index) => <article className="card p-6" key={item.id}>
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-semibold text-violet">Q{index+1}</span><span className="text-xs font-medium text-slate-500">{item.category}</span><span className="ml-auto text-xs text-slate-600">{Math.round(item.confidence*100)}% evidence confidence</span></div>
      <h2 className="mt-4 text-lg font-semibold leading-7">{item.question}</h2>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-5"><p className="eyebrow">Suggested founder answer</p><p className="mt-3 text-sm leading-7 text-slate-300">{item.suggested_answer}</p></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex gap-3 rounded-xl bg-emerald-400/[0.05] p-4"><BookOpen size={17} className="mt-0.5 shrink-0 text-mint"/><div><p className="text-xs font-semibold text-mint">Sources</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.source}</p></div></div>
        <div className="flex gap-3 rounded-xl bg-amber-400/[0.05] p-4"><FileQuestion size={17} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs font-semibold text-amber-200">Missing evidence</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.missing_evidence}</p></div></div>
      </div>
    </article>)}</div>
  </AppLayout>;
}
