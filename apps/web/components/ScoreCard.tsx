export function ScoreCard({ score, tier }: { score: number; tier: string }) {
  const color = score >= 75 ? "#5ee6b0" : score >= 55 ? "#fbbf24" : "#fb7185";
  return <div className="card flex min-h-64 flex-col justify-between p-6">
    <div><p className="eyebrow">Unadjusted, rules-based assessment</p><h2 className="mt-2 text-xl font-semibold">Strict Raise Readiness Score</h2></div>
    <div className="flex items-center gap-6">
      <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,.08) 0)`}}>
        <div className="grid h-28 w-28 place-items-center rounded-full bg-[#101827]"><div className="text-center"><strong className="text-3xl">{score.toFixed(1)}</strong><span className="block text-xs text-slate-500">out of 100</span></div></div>
      </div>
      <div><span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-200">{tier}</span><p className="mt-3 text-sm leading-6 text-slate-400">The strict score preserves every documented penalty. It is a baseline for prioritizing cleanup—not a marketing grade.</p></div>
    </div>
  </div>;
}
