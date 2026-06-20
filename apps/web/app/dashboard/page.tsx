"use client";

import { Activity, Banknote, CircleDollarSign, Download, FileWarning, HelpCircle, Timer } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { ReadinessBreakdown } from "@/components/ReadinessBreakdown";
import { RecoveryPathCard } from "@/components/RecoveryPathCard";
import { RiskCard } from "@/components/RiskCard";
import { ScoreCard } from "@/components/ScoreCard";
import { diligenceReportUrl } from "@/lib/api";
import { money } from "@/lib/format";
import { Company, FinancialSummary, Readiness, Risk, DataRoomItem, RecoveryPath } from "@/lib/types";
import { useApi } from "@/lib/useApi";

type Dashboard = { company: Company; latest_readiness_score: Readiness | null; readiness_tier: string | null; recovery_path: RecoveryPath | null; top_risks: Risk[]; missing_documents: DataRoomItem[]; financial_summary: FinancialSummary; investor_questions_count: number; open_action_items_count: number };

export default function DashboardPage() {
  const { data, loading } = useApi<Dashboard>("/companies/1/dashboard");
  if (!loading && (!data || !data.latest_readiness_score)) return <AppLayout><PageHeader eyebrow="Command center" title="Raise readiness dashboard" description="A single view of diligence health, financial pressure, and next actions."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading dashboard…</div></AppLayout>;
  const s = data.financial_summary;
  return <AppLayout><PageHeader eyebrow={`${data.company.stage} · ${data.company.industry}`} title={`${data.company.name} raise readiness`} description={data.latest_readiness_score?.summary || data.company.fundraise_goal} action={<a href={diligenceReportUrl(data.company.id)} className="button-secondary" download><Download size={16}/> Export Diligence Report</a>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Current runway" value={`${s.runway_months} mo`} hint="Below 12-month comfort threshold" icon={Timer} tone="amber"/>
      <MetricCard label="Cash balance" value={money(s.latest_cash_balance)} hint={`${money(s.latest_burn)} monthly burn`} icon={Banknote}/>
      <MetricCard label="Target raise" value={money(data.company.target_raise)} hint="Seed financing target" icon={CircleDollarSign} tone="violet"/>
      <MetricCard label="Monthly revenue" value={money(s.latest_revenue)} hint={`+${s.revenue_growth_percent}% since January`} icon={Activity}/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><ScoreCard score={data.latest_readiness_score!.overall_score} tier={data.readiness_tier || data.latest_readiness_score!.readiness_tier}/><ReadinessBreakdown score={data.latest_readiness_score!}/></div>
    {data.recovery_path && <div className="mt-6"><RecoveryPathCard recovery={data.recovery_path}/></div>}
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <section><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Priority diligence</p><h2 className="mt-2 text-xl font-semibold">Top risk flags</h2></div><span className="text-sm text-slate-500">{data.top_risks.length} shown</span></div><div className="space-y-3">{data.top_risks.map(risk => <RiskCard risk={risk} compact key={risk.id}/>)}</div></section>
      <aside className="space-y-4">
        <MetricCard label="Missing / needs review" value={String(data.missing_documents.length)} hint="Required data-room items" icon={FileWarning} tone="amber"/>
        <MetricCard label="Investor questions" value={String(data.investor_questions_count)} hint="Every answer includes sources" icon={HelpCircle} tone="violet"/>
        <MetricCard label="Open action items" value={String(data.open_action_items_count)} hint="Seven-day founder plan" icon={Activity}/>
      </aside>
    </div>
  </AppLayout>;
}
