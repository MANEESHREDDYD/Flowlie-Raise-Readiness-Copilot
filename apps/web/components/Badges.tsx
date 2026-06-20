import { titleCase } from "@/lib/format";

export function SeverityBadge({ value }: { value: string }) {
  const styles: Record<string, string> = { Critical: "bg-rose-500/15 text-rose-300 border-rose-500/25", High: "bg-orange-500/15 text-orange-300 border-orange-500/25", Medium: "bg-amber-400/15 text-amber-200 border-amber-400/25", Low: "bg-sky-400/15 text-sky-200 border-sky-400/25" };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[value] || "border-white/10 bg-white/5 text-slate-300"}`}>{value}</span>;
}
export function StatusBadge({ value }: { value: string }) {
  const style = value === "present" || value === "completed" ? "bg-emerald-400/10 text-emerald-300" : value === "needs_review" ? "bg-amber-400/10 text-amber-200" : "bg-rose-400/10 text-rose-300";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>{titleCase(value)}</span>;
}
