import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { RecoveryPath } from "@/lib/types";

export function RecoveryPathCard({ recovery }: { recovery: RecoveryPath }) {
  const liftActions = recovery.actions.filter(item => item.estimated_score_lift > 0);
  const preparednessActions = recovery.actions.filter(item => item.estimated_score_lift === 0);
  return <section className="card overflow-hidden">
    <div className="border-b border-borderDark bg-[#0d0d0d] p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow">Evidence-backed scenario</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Recovery Path</h2><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#888]">Complete the highest-leverage cleanup without changing the strict scoring rules.</p></div>
        <span className="rounded-lg bg-white/5 p-3 text-white border border-borderDark"><TrendingUp size={20}/></span>
      </div>
      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Score value={recovery.current_strict_score} label={recovery.current_tier}/>
        <ArrowRight className="rotate-90 text-[#444] sm:rotate-0" strokeWidth={1.5}/>
        <div className="rounded-xl border border-white/10 bg-[#111] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#888]">After priority cleanup</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{recovery.projected_range_low}–{recovery.projected_range_high}</p>
          <p className="mt-1 text-[12px] font-medium text-[#666] uppercase tracking-wider">{recovery.projected_tier} &middot; {recovery.projected_strict_score.toFixed(1)} point estimate</p>
        </div>
        <div className="sm:ml-auto"><p className="text-[11px] uppercase tracking-widest font-semibold text-[#888]">Estimated strict lift</p><p className="mt-1 text-3xl font-semibold tracking-tight text-white">+{recovery.estimated_strict_score_lift.toFixed(1)}</p></div>
      </div>
    </div>
    <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr] bg-panel">
      <div><p className="text-[11px] font-semibold uppercase tracking-widest text-[#666] mb-4">Score-changing actions</p><div className="grid gap-3 sm:grid-cols-2">{liftActions.map(item => <div key={item.action} className="rounded-lg border border-borderDark bg-[#0a0a0a] p-4 hover:bg-[#111] transition-colors"><div className="flex gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#888]"/><div><p className="text-[13px] font-medium text-[#dedede]">{item.action}</p><p className="mt-2 text-[12px] leading-5 text-[#666]">{item.source_evidence}</p></div><span className="ml-auto shrink-0 text-sm font-semibold text-white">+{item.estimated_score_lift.toFixed(1)}</span></div></div>)}</div></div>
      <div><p className="text-[11px] font-semibold uppercase tracking-widest text-[#666] mb-4">Preparedness-only evidence</p><div className="space-y-3">{preparednessActions.map(item => <div key={item.action} className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-4"><p className="text-[13px] font-medium text-amber-500">{item.action}</p><p className="mt-2 text-[12px] leading-5 text-amber-500/70">{item.score_basis}</p></div>)}</div><p className="mt-5 text-[11px] uppercase tracking-widest leading-5 text-[#555] font-semibold">{recovery.methodology}</p></div>
    </div>
  </section>;
}

function Score({ value, label }: { value: number; label: string }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-widest text-[#888]">Current strict score</p><p className="mt-1 text-3xl font-semibold tracking-tight text-white">{value.toFixed(1)}</p><p className="mt-1 text-[12px] uppercase tracking-wider font-medium text-[#666]">{label}</p></div>;
}
