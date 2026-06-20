"use client";

import Link from "next/link";
import { Activity, Banknote, CircleDollarSign, Download, FileWarning, HelpCircle, Pencil, Play, Timer } from "lucide-react";
import { DraftNotice } from "./DraftNotice";
import { EmptyState } from "./EmptyState";
import { MetricCard } from "./MetricCard";
import { PageHeader } from "./PageHeader";
import { ReadinessBreakdown } from "./ReadinessBreakdown";
import { RecoveryPathCard } from "./RecoveryPathCard";
import { RiskCard } from "./RiskCard";
import { ScoreCard } from "./ScoreCard";
import { diligenceReportUrl } from "@/lib/api";
import { money } from "@/lib/format";
import { ActionItem, Company, FinancialSummary, Question, Readiness, Risk, DataRoomItem, RecoveryPath } from "@/lib/types";
import { useApi } from "@/lib/useApi";

type Dashboard = {
  company: Company; latest_readiness_score: Readiness | null; readiness_tier: string | null;
  recovery_path: RecoveryPath | null; top_risks: Risk[]; missing_documents: DataRoomItem[];
  financial_summary: FinancialSummary; investor_questions_count: number; open_action_items_count: number;
};

export function CompanyDashboard({ companyId }: { companyId: string | number }) {
  const { data, loading } = useApi<Dashboard>(`/companies/${companyId}/dashboard`);
  const questions = useApi<Question[]>(`/companies/${companyId}/investor-qa`);
  const actionItems = useApi<ActionItem[]>(`/companies/${companyId}/action-plan`);
  if (!data && loading) return <div className="muted">Loading dashboard…</div>;
  if (!data) return <EmptyState title="Company not found" description="Return to the portfolio and select a company."/>;
  const actions = <div className="flex flex-wrap gap-2">
    <Link href={`/companies/${companyId}/edit-data`} className="button-secondary"><Pencil size={15}/> Edit data</Link>
    <Link href={`/companies/${companyId}/run-analysis`} className="button"><Play size={15}/> Run analysis</Link>
    {data.latest_readiness_score && <a href={diligenceReportUrl(data.company.id)} className="button-secondary"><Download size={15}/> Export report</a>}
  </div>;
  if (!data.latest_readiness_score) return <><PageHeader eyebrow={`${data.company.stage} · ${data.company.industry}`} title={`${data.company.name} raise readiness`} description="Add company records, then run the deterministic analysis." action={actions}/><EmptyState title="Analysis not run yet" description="The company is saved in SQLite. Add evidence or run a partial analysis now."/></>;
  const s = data.financial_summary;
  return <><PageHeader eyebrow={`${data.company.stage} · ${data.company.industry}`} title={`${data.company.name} raise readiness`} description={data.latest_readiness_score.summary} action={actions}/>
    <div className="mb-6"><DraftNotice text={`Draft analysis — requires operator review (${(data.latest_readiness_score.review_status || "needs_review").replace("_", " ")}). Source-backed preparation notes for a human operator, not legal, tax, investment, or accounting advice.`}/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Current runway" value={`${s.runway_months} mo`} hint="Cash divided by latest burn" icon={Timer} tone="amber"/>
      <MetricCard label="Cash balance" value={money(s.latest_cash_balance)} hint={`${money(s.latest_burn)} monthly burn`} icon={Banknote}/>
      <MetricCard label="Target raise" value={money(data.company.target_raise)} hint={data.company.stage} icon={CircleDollarSign} tone="violet"/>
      <MetricCard label="Monthly revenue" value={money(s.latest_revenue)} hint={`${s.revenue_growth_percent}% period growth`} icon={Activity}/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><ScoreCard score={data.latest_readiness_score.overall_score} tier={data.readiness_tier || data.latest_readiness_score.readiness_tier}/><ReadinessBreakdown score={data.latest_readiness_score}/></div>
    {data.recovery_path && <div className="mt-6"><RecoveryPathCard recovery={data.recovery_path}/></div>}
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <section><p className="eyebrow">Priority diligence</p><h2 className="mb-4 mt-2 text-xl font-semibold">Top risk flags</h2><div className="space-y-3">{data.top_risks.map(risk => <RiskCard risk={risk} compact key={risk.id}/>)}</div></section>
      <aside className="space-y-4">
        <MetricCard label="Missing / needs review" value={String(data.missing_documents.length)} hint="Required data-room items" icon={FileWarning} tone="amber"/>
        <MetricCard label="Investor questions" value={String(data.investor_questions_count)} hint="Source-backed preparation" icon={HelpCircle} tone="violet"/>
        <MetricCard label="Open action items" value={String(data.open_action_items_count)} hint="Readiness work queue" icon={Activity}/>
      </aside>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="card p-6"><p className="eyebrow">Source-backed preparation notes · needs review</p><h2 className="mt-2 text-xl font-semibold">Draft diligence Q&A</h2><div className="mt-5 space-y-4">{questions.data?.slice(0,3).map(item=><div key={item.id} className="border-b border-white/10 pb-4 last:border-0"><p className="font-medium">{item.question}</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{item.suggested_answer}</p><p className="mt-2 text-xs text-mint">Source: {item.source}</p></div>)}{!questions.data?.length&&<p className="text-sm text-slate-500">Run analysis to generate draft preparation notes.</p>}</div></section>
      <section className="card p-6"><p className="eyebrow">Cleanup queue · needs review</p><h2 className="mt-2 text-xl font-semibold">Draft cleanup queue</h2><div className="mt-5 space-y-3">{actionItems.data?.slice(0,5).map(item=><div key={item.id} className="rounded-xl bg-white/[0.035] p-4"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{item.title}</p><span className="shrink-0 text-xs text-mint">{item.estimated_score_lift?`+${item.estimated_score_lift}`:"Prep"}</span></div><p className="mt-2 text-xs text-slate-500">{item.owner} · due {item.due_date}</p></div>)}{!actionItems.data?.length&&<p className="text-sm text-slate-500">Run analysis to create an action plan.</p>}</div></section>
    </div>
  </>;
}
