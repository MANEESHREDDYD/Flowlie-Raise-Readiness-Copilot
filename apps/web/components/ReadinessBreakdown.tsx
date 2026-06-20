import { Readiness } from "@/lib/types";

export function ReadinessBreakdown({ score }: { score: Readiness }) {
  const values = [
    ["Finance", score.finance_score], ["Data room", score.data_room_score], ["Compliance", score.compliance_score],
    ["Cap table", score.cap_table_score], ["Pipeline", score.pipeline_score], ["Meeting follow-up", score.meeting_score],
  ] as const;
  return <div className="card p-6"><p className="eyebrow">Weighted components</p><h2 className="mt-2 text-xl font-semibold">Readiness breakdown</h2>
    <div className="mt-6 space-y-4">{values.map(([name, value]) => <div key={name}>
      <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">{name}</span><strong>{value.toFixed(0)}</strong></div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-violet to-mint" style={{width: `${value}%`}}/></div>
    </div>)}</div>
  </div>;
}
