import { motion } from "framer-motion";

export function ScoreCard({ score, tier }: { score: number; tier: string }) {
  const color = score >= 75 ? "#fff" : score >= 55 ? "#a3a3a3" : "#555";
  return <motion.div 
    whileHover={{ y: -2 }} 
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    className="card flex min-h-64 flex-col justify-between p-6 hover:bg-[#111]"
  >
    <div><p className="eyebrow">Unadjusted, rules-based assessment</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Strict Raise Readiness Score</h2></div>
    <div className="flex items-center gap-6">
      <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,.05) 0)`}}>
        <div className="grid h-[132px] w-[132px] place-items-center rounded-full bg-[#0a0a0a]"><div className="text-center"><strong className="text-3xl font-semibold tracking-tight text-white">{score.toFixed(1)}</strong><span className="block text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">out of 100</span></div></div>
      </div>
      <div><span className="inline-flex rounded-md border border-borderDark bg-[#111] px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase text-[#ededed]">{tier}</span><p className="mt-3 text-[13px] leading-6 text-[#888]">The strict score preserves every documented penalty. It is a baseline for prioritizing cleanup—not a marketing grade.</p></div>
    </div>
  </motion.div>;
}
