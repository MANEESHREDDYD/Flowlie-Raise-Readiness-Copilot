import { titleCase } from "@/lib/format";

export function SeverityBadge({ value }: { value: string }) {
  const styles: Record<string, string> = { 
    Critical: "bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/20", 
    High: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20", 
    Medium: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20", 
    Low: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20" 
  };
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${styles[value] || "border-borderDark bg-[#111] text-[#888]"}`}>{value}</span>;
}
export function StatusBadge({ value }: { value: string }) {
  const style = value === "present" || value === "completed" ? "bg-[#111] text-[#fff] border-borderDark" : value === "needs_review" ? "bg-[#111] text-[#a3a3a3] border-borderDark" : "bg-[#111] text-[#666] border-borderDark";
  return <span className={`inline-flex border rounded-md px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${style}`}>{titleCase(value)}</span>;
}
export function ReviewBadge({ value }: { value?: string }) {
  const v = value || "needs_review";
  const style = v === "reviewed" ? "bg-[#111] text-[#fff] border-borderDark" : v === "draft" ? "bg-[#0a0a0a] text-[#666] border-borderDark" : "bg-[#111] text-[#a3a3a3] border-borderDark";
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${style}`}>{titleCase(v)}</span>;
}
