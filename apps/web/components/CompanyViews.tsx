"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Banknote, BookOpen, CalendarDays, ChartNoAxesCombined, FileQuestion, Timer, UserRound } from "lucide-react";
import { AppLayout } from "./Layout";
import { DraftNotice } from "./DraftNotice";
import { EmptyState } from "./EmptyState";
import { MetricCard } from "./MetricCard";
import { PageHeader } from "./PageHeader";
import { RiskCard } from "./RiskCard";
import { SeverityBadge, StatusBadge } from "./Badges";
import { money, percent, titleCase } from "@/lib/format";
import { ActionItem, CapEntry, Company, Compliance, DataRoomItem, Financial, FinancialSummary, Question, Risk } from "@/lib/types";
import { useApi } from "@/lib/useApi";

type CompanyViewProps = { companyId: string | number };

function useCompany(companyId: string | number) {
  return useApi<Company>(`/companies/${companyId}`);
}

export function CompanyFinancials({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const metrics = useApi<Financial[]>(`/companies/${companyId}/financials`);
  const summary = useApi<FinancialSummary>(`/companies/${companyId}/financials/summary`);
  if (!metrics.loading && !metrics.data) return <AppLayout><PageHeader eyebrow="Finance" title="Runway & burn" description="Monthly operating trends and financing pressure points."/><EmptyState/></AppLayout>;
  if (!metrics.data || !summary.data) return <AppLayout><div className="muted">Loading financials…</div></AppLayout>;
  const chart = metrics.data.map(item => ({...item, margin: item.gross_margin * 100, label: item.month.slice(5)}));
  const name = company.data?.name || "Company";
  return <AppLayout><PageHeader eyebrow="Finance intelligence" title={`${name} runway, burn & margin`} description="Structured monthly evidence used by the strict readiness and confidence engines."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Runway" value={`${summary.data.runway_months} mo`} hint="Cash ÷ latest monthly burn" icon={Timer} tone="amber"/>
      <MetricCard label="Latest burn" value={money(summary.data.latest_burn)} hint={`${summary.data.burn_increase_percent}% period change`} icon={Activity} tone="amber"/>
      <MetricCard label="Latest revenue" value={money(summary.data.latest_revenue)} hint={`${summary.data.revenue_growth_percent}% period growth`} icon={ChartNoAxesCombined}/>
      <MetricCard label="Cash" value={money(summary.data.latest_cash_balance)} hint="Latest reported balance" icon={Banknote} tone="violet"/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <ChartCard title="Revenue vs. burn" subtitle="Monthly USD"><ResponsiveContainer width="100%" height={300}><AreaChart data={chart}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={.28}/><stop offset="100%" stopColor="#fff" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="label" stroke="#64748b"/><YAxis stroke="#64748b" tickFormatter={v => `$${v/1000}k`}/><Tooltip contentStyle={{background:"#111",border:"1px solid rgba(255,255,255,.1)",borderRadius:8}}/><Area type="monotone" dataKey="revenue" stroke="#fff" fill="url(#rev)" strokeWidth={2}/><Line type="monotone" dataKey="burn" stroke="#a3a3a3" strokeWidth={2}/></AreaChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Gross margin" subtitle="Reported monthly percentage"><ResponsiveContainer width="100%" height={300}><LineChart data={chart}><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false}/><XAxis dataKey="label" stroke="#64748b"/><YAxis domain={[0,100]} stroke="#64748b" tickFormatter={v => `${v}%`}/><Tooltip contentStyle={{background:"#111",border:"1px solid rgba(255,255,255,.1)",borderRadius:8}}/><Line type="monotone" dataKey="margin" stroke="#fff" strokeWidth={3} dot={{fill:"#fff"}}/></LineChart></ResponsiveContainer></ChartCard>
    </div>
    <div className="card mt-6 p-6"><p className="eyebrow">Operator preparation note</p><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Revenue changed {summary.data.revenue_growth_percent}% across the available period, burn changed {summary.data.burn_increase_percent}%, and gross margin changed {Math.round(summary.data.gross_margin_change * 100)} percentage points. Review source records before using these figures externally.</p></div>
  </AppLayout>;
}

export function CompanyCapTable({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const {data, loading} = useApi<CapEntry[]>(`/companies/${companyId}/cap-table`);
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Ownership" title="Cap table clarity" description="Current ownership records and dilution-model warnings."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading cap table…</div></AppLayout>;
  const founders = data.filter(item => item.is_founder).reduce((sum,item)=>sum+(item.ownership_percent||0),0);
  const pool = data.find(item => item.type.toLowerCase() === "option_pool")?.ownership_percent || 0;
  return <AppLayout><PageHeader eyebrow="Ownership & dilution" title={`${company.data?.name || "Company"} cap table`} description="Founder ownership uses an explicit structural flag rather than holder-name matching."/>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Stat label="Founder ownership" value={`${founders}%`}/><Stat label="Option pool" value={`${pool}%`}/><Stat label="Unmodeled instruments" value={String(data.filter(item=>item.ownership_percent===null).length)}/></div>
    <div className="table-wrap"><table><thead><tr><th>Holder</th><th>Founder</th><th>Security</th><th>Ownership</th><th>Shares</th><th>Notes</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td className="font-medium text-white">{item.holder}</td><td>{item.is_founder ? "Yes" : "No"}</td><td>{titleCase(item.type)}</td><td>{item.ownership_percent === null ? <span className="text-amber-300">Not modeled</span> : percent(item.ownership_percent/100)}</td><td>{item.shares?.toLocaleString() || "—"}</td><td className="text-slate-500">{item.notes || "—"}</td></tr>)}</tbody></table></div>
    {data.some(item => item.type.toLowerCase() === "safe" && item.ownership_percent === null) && <div className="mt-5 flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-5"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={20}/><div><h2 className="font-semibold text-amber-100">Convertible instrument is not modeled</h2><p className="mt-2 text-sm leading-6 text-amber-100/60">Build a fully diluted pro-forma view before investor diligence.</p></div></div>}
  </AppLayout>;
}

export function CompanyCompliance({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const {data, loading} = useApi<Compliance[]>(`/companies/${companyId}/compliance`);
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Operations" title="Compliance & HR" description="Diligence-oriented checklist; not a legal conclusion."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading checklist…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Potential diligence concerns" title={`${company.data?.name || "Company"} compliance review`} description="Statuses show what evidence is present, missing, outdated, or awaiting review—not a legal-compliance determination."/>
    <div className="table-wrap"><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Last updated</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td className="font-medium text-white">{item.item}</td><td><StatusBadge value={item.status}/></td><td>{item.owner}</td><td className="text-slate-500">{item.last_updated || "No evidence date"}</td></tr>)}</tbody></table></div>
  </AppLayout>;
}

export function CompanyDataRoom({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const { data, loading } = useApi<DataRoomItem[]>(`/companies/${companyId}/data-room`);
  if (!loading && !data) return <AppLayout><PageHeader eyebrow="Evidence" title="Data-room completeness" description="Required diligence artifacts grouped by operating category."/><EmptyState/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading data room…</div></AppLayout>;
  const categories = Array.from(new Set(data.map(item => item.category)));
  const present = data.filter(item => item.status === "present").length;
  return <AppLayout><PageHeader eyebrow="Evidence inventory" title={`${company.data?.name || "Company"} data room`} description={`${present} of ${data.length} expected items are present. Gaps feed the readiness score, risks, confidence audit, and cleanup queue.`}/>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Summary label="Present" value={present} tone="text-white"/><Summary label="Missing" value={data.filter(item => item.status === "missing").length} tone="text-rose-300"/><Summary label="Needs review" value={data.filter(item => item.status === "needs_review").length} tone="text-amber-200"/></div>
    <div className="space-y-6">{categories.map(category => <section key={category}><h2 className="mb-3 text-sm font-semibold text-slate-300">{category}</h2><div className="table-wrap"><table><thead><tr><th>Expected document</th><th>Status</th><th>Readiness treatment</th></tr></thead><tbody>{data.filter(item => item.category === category).map(item => <tr key={item.key}><td className="font-medium text-white">{item.name}</td><td><StatusBadge value={item.status}/></td><td className="text-slate-500">{item.status === "present" ? "Full credit" : item.status === "needs_review" ? "Half credit" : "No credit until supplied"}</td></tr>)}</tbody></table></div></section>)}</div>
  </AppLayout>;
}

export function CompanyRisks({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const {data, loading} = useApi<Risk[]>(`/companies/${companyId}/risks`);
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Diligence triage" title="Risk flags" description="Evidence-based concerns and remediation guidance."/><EmptyState title="No generated risks" description="Run analysis for this company to generate a draft risk review."/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading risks…</div></AppLayout>;
  const order = ["Critical","High","Medium","Low"];
  return <AppLayout><PageHeader eyebrow="Deterministic risk engine" title={`${company.data?.name || "Company"} diligence concerns`} description={`${data.length} rule-based flags generated from this company's stored financial, people, compliance, ownership, pipeline, and meeting evidence.`}/>
    <div className="mb-6"><DraftNotice text="Draft output — requires operator review. These are potential diligence concerns, not legal or compliance conclusions."/></div>
    <div className="space-y-8">{order.map(severity => {
      const items = data.filter(risk => risk.severity === severity);
      if (!items.length) return null;
      return <section key={severity}><div className="mb-4 flex items-center gap-3"><h2 className="text-lg font-semibold">{severity}</h2><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-500">{items.length}</span></div><div className="grid gap-4">{items.map(risk => <RiskCard risk={risk} key={risk.id}/>)}</div></section>;
    })}</div>
  </AppLayout>;
}

export function CompanyInvestorQa({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const {data, loading} = useApi<Question[]>(`/companies/${companyId}/investor-qa`);
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Founder preparation" title="Investor diligence Q&A" description="Template-based answers grounded in named source evidence."/><EmptyState title="No preparation notes" description="Run analysis for this company to generate source-backed draft Q&A."/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading Q&A…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Source-backed preparation notes" title={`${company.data?.name || "Company"} investor Q&A`} description="Every draft answer cites available evidence and calls out what remains missing."/>
    <div className="mb-6"><DraftNotice text="Draft output — requires operator review. Source-backed preparation notes for a human operator."/></div>
    <div className="space-y-4">{data.map((item,index) => <article className="card p-6" key={item.id}>
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">Q{index+1}</span><span className="text-xs font-medium text-slate-500">{item.category}</span><span className="ml-auto text-xs text-slate-600">{Math.round(item.confidence*100)}% evidence confidence</span></div>
      <h2 className="mt-4 text-lg font-semibold leading-7">{item.question}</h2>
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-5"><p className="eyebrow">Suggested founder answer</p><p className="mt-3 text-sm leading-7 text-slate-300">{item.suggested_answer}</p></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex gap-3 rounded-lg bg-white/[0.04] p-4"><BookOpen size={17} className="mt-0.5 shrink-0 text-white"/><div><p className="text-xs font-semibold text-white">Sources</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.source}</p></div></div>
        <div className="flex gap-3 rounded-lg bg-amber-400/[0.05] p-4"><FileQuestion size={17} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs font-semibold text-amber-200">Missing evidence</p><p className="mt-1 text-xs leading-5 text-slate-400">{item.missing_evidence}</p></div></div>
      </div>
    </article>)}</div>
  </AppLayout>;
}

export function CompanyActionPlan({ companyId }: CompanyViewProps) {
  const company = useCompany(companyId);
  const {data, loading} = useApi<ActionItem[]>(`/companies/${companyId}/action-plan`);
  if (!loading && (!data || !data.length)) return <AppLayout><PageHeader eyebrow="Seven-day sprint" title="Cleanup queue" description="Risk-driven diligence tasks with clear owners and dates."/><EmptyState title="No cleanup queue" description="Run analysis for this company to generate draft action items."/></AppLayout>;
  if (!data) return <AppLayout><div className="muted">Loading action plan…</div></AppLayout>;
  return <AppLayout><PageHeader eyebrow="Seven-day cleanup queue" title={`${company.data?.name || "Company"} action plan`} description="A practical sequence for closing the highest-leverage diligence gaps before the next investor conversation."/>
    <div className="mb-6"><DraftNotice/></div>
    <div className="relative space-y-3 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-white/10">{data.map((item,index) => <article className="card relative ml-12 p-5" key={item.id}>
      <span className="absolute -left-[45px] top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#111] text-xs font-bold text-white">{index+1}</span>
      <div className="flex flex-wrap items-center gap-2"><SeverityBadge value={item.priority}/><span className="text-xs text-slate-500">{item.category}</span>{item.estimated_score_lift > 0 ? <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">Estimated strict lift +{item.estimated_score_lift.toFixed(1)}</span> : <span className="rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Preparedness only</span>}<span className="ml-auto"><StatusBadge value={item.status}/></span></div>
      <h2 className="mt-3 font-semibold">{item.title}</h2>
      <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-500"><span className="flex items-center gap-1.5"><UserRound size={14}/>{item.owner}</span><span className="flex items-center gap-1.5"><CalendarDays size={14}/>{item.due_date}</span></div>
    </article>)}</div>
  </AppLayout>;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="card p-6"><div className="mb-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</section>;
}

function Stat({label,value}:{label:string;value:string}) {
  return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}

function Summary({label,value,tone}:{label:string;value:number;tone:string}) {
  return <div className="card p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p></div>;
}
