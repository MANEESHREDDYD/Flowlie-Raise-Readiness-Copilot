import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function MetricCard({ label, value, hint, icon: Icon, tone = "mint" }: { label: string; value: string; hint?: string; icon?: LucideIcon; tone?: "mint" | "violet" | "amber" }) {
  // Map all tones to a neutral/monochrome brutalist style, but keep amber as a subtle warning if needed.
  const color = tone === "amber" ? "text-amber-500 bg-amber-500/10" : "text-white bg-white/5";
  return <motion.div 
    whileHover={{ y: -2, scale: 1.01 }} 
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className="card p-5 cursor-default transition-colors hover:bg-[#111]"
  >
    <div className="flex items-start justify-between"><p className="text-[13px] font-medium text-slate-400">{label}</p>{Icon && <span className={`rounded-md p-1.5 ${color}`}><Icon size={14}/></span>}</div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
    {hint && <p className="mt-2 text-xs text-[#666] font-medium">{hint}</p>}
  </motion.div>;
}
