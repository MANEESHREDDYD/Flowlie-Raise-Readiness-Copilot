import { ClipboardCheck } from "lucide-react";

export function DraftNotice({ text = "Draft preparation output — operator review required before founder or investor use." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-borderDark bg-[#111] px-4 py-3 text-[13px] font-medium text-[#ccc]">
      <ClipboardCheck size={16} className="shrink-0 text-[#888]" />
      <span>{text}</span>
    </div>
  );
}
