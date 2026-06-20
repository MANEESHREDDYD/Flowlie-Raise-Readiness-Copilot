import { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, hint, icon: Icon, tone = "mint" }: { label: string; value: string; hint?: string; icon?: LucideIcon; tone?: "mint" | "violet" | "amber" }) {
  const color = tone === "mint" ? "text-mint bg-mint/10" : tone === "violet" ? "text-violet bg-violet/10" : "text-amber-300 bg-amber-400/10";
  return <div className="card p-5">
    <div className="flex items-start justify-between"><p className="text-sm text-slate-400">{label}</p>{Icon && <span className={`rounded-lg p-2 ${color}`}><Icon size={16}/></span>}</div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
    {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
  </div>;
}
