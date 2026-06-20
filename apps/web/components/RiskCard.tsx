import { useState } from "react";
import { Risk } from "@/lib/types";
import { api } from "@/lib/api";
import { SeverityBadge } from "./Badges";
import { motion } from "framer-motion";

export function RiskCard({ risk, compact = false }: { risk: Risk; compact?: boolean }) {
  const [note, setNote] = useState(risk.operator_note || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (note === risk.operator_note) return;
    setSaving(true);
    await api<Risk>(`/risks/${risk.id}`, {
      method: "PATCH",
      body: JSON.stringify({ operator_note: note })
    });
    setSaving(false);
  };

  return <motion.article
    whileHover={{ x: 2 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    className="card p-5 border-l-[3px] hover:bg-[#111]"
    style={{ borderLeftColor: risk.severity === 'high' ? '#f43f5e' : risk.severity === 'medium' ? '#f59e0b' : '#3b82f6' }}
  >
    <div className="flex flex-wrap items-center gap-2">
      <SeverityBadge value={risk.severity}/>
      <span className="text-[13px] font-medium text-slate-500">{risk.category}</span>
      {risk.evidence_quality && <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-[#888]">Evidence: {risk.evidence_quality}</span>}
    </div>
    <h3 className="mt-3 text-base font-semibold tracking-tight text-white">{risk.title}</h3>
    <p className="mt-2 text-sm leading-6 text-[#999]">{risk.evidence}</p>
    {!compact && <div className="mt-5 border-t border-borderDark pt-5">
      <div className="rounded-lg border border-borderDark bg-[#0d0d0d] p-4"><p className="text-[12px] font-medium text-white mb-2">Why this matters to investors</p><p className="text-sm leading-6 text-[#888]">{risk.why_matters_to_investors}</p></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2"><div><p className="text-[12px] font-medium text-white mb-2">Potential impact</p><p className="text-sm leading-6 text-[#888]">{risk.business_impact}</p></div><div><p className="text-[12px] font-medium text-white mb-2">Suggested fix</p><p className="text-sm leading-6 text-[#888]">{risk.suggested_fix}</p></div></div>
      <div className="mt-5">
        <p className="text-[12px] font-medium text-white mb-2">Operator Note {saving && <span className="text-[#666] font-normal">(Saving...)</span>}</p>
        <textarea 
          className="w-full rounded-lg border border-borderDark bg-[#050505] p-3 text-sm text-white placeholder-[#555] focus:border-white/40 focus:outline-none transition-colors"
          rows={2}
          placeholder="Add operator notes here..."
          value={note}
          onChange={e => setNote(e.target.value)}
          onBlur={handleSave}
        />
      </div>
    </div>}
  </motion.article>;
}
