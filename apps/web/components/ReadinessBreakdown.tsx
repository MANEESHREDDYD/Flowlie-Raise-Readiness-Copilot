import { Readiness } from "@/lib/types";
import { motion } from "framer-motion";

export function ReadinessBreakdown({ score }: { score: Readiness }) {
  const values = [
    ["Finance", score.finance_score], ["Data room", score.data_room_score], ["Compliance", score.compliance_score],
    ["Cap table", score.cap_table_score], ["Pipeline", score.pipeline_score], ["Meeting follow-up", score.meeting_score],
  ] as const;
  return <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="card p-6 hover:bg-[#111]">
    <p className="eyebrow">Weighted components</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Readiness breakdown</h2>
    <div className="mt-6 space-y-4">{values.map(([name, value]) => <div key={name}>
      <div className="mb-2 flex justify-between text-[13px]"><span className="text-[#888] font-medium">{name}</span><strong className="text-white">{value.toFixed(0)}</strong></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#222]"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-white"/></div>
    </div>)}</div>
  </motion.div>;
}
