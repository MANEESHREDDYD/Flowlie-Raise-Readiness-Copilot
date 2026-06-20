import { ClipboardCheck } from "lucide-react";

export function DraftNotice({ text = "Draft output — requires operator review." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100">
      <ClipboardCheck size={16} className="shrink-0 text-amber-300" />
      <span>{text}</span>
    </div>
  );
}
