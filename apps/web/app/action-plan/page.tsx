"use client";

import { CalendarDays, UserRound } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { ActionItem } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function ActionPlanPage() {
  const {data, loading} = useApi<ActionItem[]>("/companies/1/action-plan");
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Seven-day sprint" title="Founder action plan" description="Risk-driven diligence tasks with clear owners and dates."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading action plan…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Seven-day readiness sprint" title="Founder action plan" description="A practical sequence for closing the highest-leverage diligence gaps before the next investor meeting."/>
    <div className="relative space-y-3 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-white/10">{data.map((item,index) => <article className="card relative ml-12 p-5" key={item.id}>
      <span className="absolute -left-[45px] top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#111827] text-xs font-bold text-mint">{index+1}</span>
      <div className="flex flex-wrap items-center gap-2"><SeverityBadge value={item.priority}/><span className="text-xs text-slate-500">{item.category}</span>{item.estimated_score_lift > 0 ? <span className="rounded-full bg-mint/10 px-2.5 py-1 text-[11px] font-semibold text-mint">Estimated strict lift +{item.estimated_score_lift.toFixed(1)}</span> : <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Preparedness only</span>}<span className="ml-auto"><StatusBadge value={item.status}/></span></div>
      <h2 className="mt-3 font-semibold">{item.title}</h2>
      <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500"><span className="flex items-center gap-1.5"><UserRound size={14}/>{item.owner}</span><span className="flex items-center gap-1.5"><CalendarDays size={14}/>{item.due_date}</span></div>
    </article>)}</div>
  </AppLayout>;
}
