"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, Bot, Building2, CircleDollarSign, ClipboardCheck, FileStack, Gauge, LayoutDashboard, ShieldAlert, Users } from "lucide-react";

const links = [
  ["/companies", "Operator portfolio", Building2],
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/data-room", "Data room", FileStack],
  ["/financials", "Financials", BarChart3],
  ["/compliance", "Compliance", ClipboardCheck],
  ["/cap-table", "Cap table", Users],
  ["/risks", "Diligence concerns", ShieldAlert],
  ["/investor-qa", "Preparation notes", Bot],
  ["/action-plan", "Cleanup queue", BookOpenCheck],
  ["/demo", "Demo controls", Gauge],
] as const;

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#080d17]/90 px-4 py-6 backdrop-blur-xl lg:block">
      <Link href="/" className="mb-9 flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-slate-950"><CircleDollarSign size={21}/></span>
        <span><strong className="block text-base">DiligenceOps</strong><span className="text-xs text-slate-500">Console</span></span>
      </Link>
      <nav className="space-y-1">
        {links.map(([href, label, Icon]) => {
          const active = path === href;
          return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon size={17} className={active ? "text-mint" : ""}/>{label}
          </Link>;
        })}
      </nav>
      <div className="absolute bottom-6 left-4 right-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-white"><Building2 size={14} className="text-mint"/> Operator workbench</div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Founder-provided evidence in, operator-review drafts out. Not legal, tax, investment, or accounting advice.</p>
      </div>
    </aside>
  );
}
