import { Risk } from "@/lib/types";
import { SeverityBadge } from "./Badges";

export function RiskCard({ risk, compact = false }: { risk: Risk; compact?: boolean }) {
  return <article className="card p-5">
    <div className="flex flex-wrap items-center gap-2"><SeverityBadge value={risk.severity}/><span className="text-xs font-medium text-slate-500">{risk.category}</span></div>
    <h3 className="mt-3 font-semibold text-white">{risk.title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">{risk.evidence}</p>
    {!compact && <div className="mt-4 border-t border-white/10 pt-4">
      <div className="rounded-xl border border-violet/10 bg-violet/[0.05] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet">Why this matters to investors</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.why_matters_to_investors}</p></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Potential impact</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.business_impact}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-mint">Suggested fix</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.suggested_fix}</p></div></div>
    </div>}
  </article>;
}
