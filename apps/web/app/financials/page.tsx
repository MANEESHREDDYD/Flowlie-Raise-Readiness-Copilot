"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Banknote, ChartNoAxesCombined, Timer } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { Financial, FinancialSummary } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { money } from "@/lib/format";

export default function FinancialsPage() {
  const metrics = useApi<Financial[]>("/companies/1/financials");
  const summary = useApi<FinancialSummary>("/companies/1/financials/summary");
  if (!metrics.loading && !metrics.data) return <AppLayout><PageHeader eyebrow="Finance" title="Runway & burn" description="Monthly operating trends and investor-facing financial pressure points."/><EmptyState/></AppLayout>;
  if (!metrics.data || !summary.data) return <AppLayout><div className="muted">Loading financials…</div></AppLayout>;
  const chart = metrics.data.map(item => ({...item, margin: item.gross_margin * 100, label: item.month.slice(5)}));
  return <AppLayout><PageHeader eyebrow="Finance intelligence" title="Runway, burn & margin" description="AtlasAI is growing revenue, but burn acceleration and margin compression weaken the current financing position."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Runway" value={`${summary.data.runway_months} mo`} hint="Cash ÷ latest monthly burn" icon={Timer} tone="amber"/>
      <MetricCard label="Latest burn" value={money(summary.data.latest_burn)} hint={`+${summary.data.burn_increase_percent}% since January`} icon={Activity} tone="amber"/>
      <MetricCard label="Latest revenue" value={money(summary.data.latest_revenue)} hint={`+${summary.data.revenue_growth_percent}% growth`} icon={ChartNoAxesCombined}/>
      <MetricCard label="Cash" value={money(summary.data.latest_cash_balance)} hint="May 2026 ending balance" icon={Banknote} tone="violet"/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Revenue vs. burn" subtitle="Monthly USD"><ResponsiveContainer width="100%" height={300}><AreaChart data={chart}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5ee6b0" stopOpacity={.32}/><stop offset="100%" stopColor="#5ee6b0" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="label" stroke="#64748b"/><YAxis stroke="#64748b" tickFormatter={v => `$${v/1000}k`}/><Tooltip contentStyle={{background:"#111827",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/><Area type="monotone" dataKey="revenue" stroke="#5ee6b0" fill="url(#rev)" strokeWidth={2}/><Line type="monotone" dataKey="burn" stroke="#fb923c" strokeWidth={2}/></AreaChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Gross margin compression" subtitle="72% → 54%"><ResponsiveContainer width="100%" height={300}><LineChart data={chart}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="label" stroke="#64748b"/><YAxis domain={[40,80]} stroke="#64748b" tickFormatter={v => `${v}%`}/><Tooltip contentStyle={{background:"#111827",border:"1px solid rgba(255,255,255,.1)",borderRadius:12}}/><Line type="monotone" dataKey="margin" stroke="#8b7cf6" strokeWidth={3} dot={{fill:"#8b7cf6"}}/></LineChart></ResponsiveContainer></ChartCard>
    </div>
    <div className="card mt-6 p-6"><p className="eyebrow">Founder talking point</p><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Revenue rose 39.3% across the period, while burn rose 61.0% and gross margin fell 18 percentage points. The diligence story needs a margin bridge, department-level expense detail, and a milestone-linked use-of-funds plan.</p></div>
  </AppLayout>;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="card p-6"><div className="mb-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</section>;
}
