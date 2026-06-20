import { useState } from "react";
import { Risk } from "@/lib/types";
import { SeverityBadge } from "./Badges";

export function RiskCard({ risk, compact = false }: { risk: Risk; compact?: boolean }) {
  const [note, setNote] = useState(risk.operator_note || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (note === risk.operator_note) return;
    setSaving(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/risks/${risk.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operator_note: note })
    });
    setSaving(false);
  };

  return <article className="card p-5">
    <div className="flex flex-wrap items-center gap-2">
      <SeverityBadge value={risk.severity}/>
      <span className="text-xs font-medium text-slate-500">{risk.category}</span>
      {risk.evidence_quality && <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">Evidence: {risk.evidence_quality}</span>}
    </div>
    <h3 className="mt-3 font-semibold text-white">{risk.title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-400">{risk.evidence}</p>
    {!compact && <div className="mt-4 border-t border-white/10 pt-4">
      <div className="rounded-xl border border-violet/10 bg-violet/[0.05] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet">Why this matters to investors</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.why_matters_to_investors}</p></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Potential impact</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.business_impact}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-mint">Suggested fix</p><p className="mt-2 text-sm leading-6 text-slate-300">{risk.suggested_fix}</p></div></div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">Operator Note {saving && <span className="text-slate-500 lowercase">(Saving...)</span>}</p>
        <textarea 
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-mint focus:outline-none" 
          rows={2} 
          placeholder="Add operator notes here..." 
          value={note} 
          onChange={e => setNote(e.target.value)} 
          onBlur={handleSave} 
        />
      </div>
    </div>}
  </article>;
}
