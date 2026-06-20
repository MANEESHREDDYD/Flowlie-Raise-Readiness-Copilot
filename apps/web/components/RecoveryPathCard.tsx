import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { RecoveryPath } from "@/lib/types";

export function RecoveryPathCard({ recovery }: { recovery: RecoveryPath }) {
  const liftActions = recovery.actions.filter(item => item.estimated_score_lift > 0);
  const preparednessActions = recovery.actions.filter(item => item.estimated_score_lift === 0);
  return <section className="card overflow-hidden">
    <div className="border-b border-white/10 bg-gradient-to-r from-violet/10 to-mint/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">Evidence-backed scenario</p><h2 className="mt-2 text-xl font-semibold">Recovery Path</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Complete the highest-leverage cleanup without changing the strict scoring rules.</p></div>
        <span className="rounded-xl bg-mint/10 p-3 text-mint"><TrendingUp size={22}/></span>
      </div>
      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Score value={recovery.current_strict_score} label={recovery.current_tier}/>
        <ArrowRight className="rotate-90 text-slate-600 sm:rotate-0"/>
        <div className="rounded-2xl border border-mint/20 bg-mint/[0.06] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-mint">After priority cleanup</p>
          <p className="mt-1 text-3xl font-semibold">{recovery.projected_range_low}–{recovery.projected_range_high}</p>
          <p className="mt-1 text-xs text-slate-400">{recovery.projected_tier} · {recovery.projected_strict_score.toFixed(1)} point estimate</p>
        </div>
        <div className="sm:ml-auto"><p className="text-xs uppercase tracking-wider text-slate-500">Estimated strict lift</p><p className="mt-1 text-3xl font-semibold text-mint">+{recovery.estimated_strict_score_lift.toFixed(1)}</p></div>
      </div>
    </div>
    <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr]">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score-changing actions</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{liftActions.map(item => <div key={item.action} className="rounded-xl border border-white/5 bg-white/[0.025] p-4"><div className="flex gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-mint"/><div><p className="text-sm font-medium text-white">{item.action}</p><p className="mt-2 text-xs leading-5 text-slate-500">{item.source_evidence}</p></div><span className="ml-auto shrink-0 text-sm font-semibold text-mint">+{item.estimated_score_lift.toFixed(1)}</span></div></div>)}</div></div>
      <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preparedness-only evidence</p>{preparednessActions.map(item => <div key={item.action} className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-4"><p className="text-sm font-medium">{item.action}</p><p className="mt-2 text-xs leading-5 text-slate-500">{item.score_basis}</p></div>)}<p className="mt-4 text-xs leading-5 text-slate-600">{recovery.methodology}</p></div>
    </div>
  </section>;
}

function Score({ value, label }: { value: number; label: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current strict score</p><p className="mt-1 text-3xl font-semibold">{value.toFixed(1)}</p><p className="mt-1 text-xs text-rose-200">{label}</p></div>;
}
