import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Database, FileSearch, Gauge, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  [Gauge, "Strict score + recovery", "An honest weighted baseline plus an evidence-backed path showing which cleanup actions can improve it."],
  [FileSearch, "Diligence intelligence", "Source-backed investor questions and founder-ready answer drafts without unsupported claims."],
  [ShieldCheck, "Risk triage", "Deterministic flags for runway, margin, IP, compliance, cap table, and customer concentration."],
] as const;

export default function Landing() {
  return <main className="min-h-screen overflow-hidden">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-slate-950"><Sparkles size={18}/></span>Flowlie <span className="hidden text-slate-500 sm:inline">/ Raise Readiness</span></div>
      <Link href="/demo" className="button-secondary">Launch demo <ArrowRight size={15}/></Link>
    </nav>
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
      <div className="max-w-4xl">
        <p className="eyebrow">Local-first fundraising intelligence</p>
        <h1 className="mt-5 text-5xl font-semibold leading-[1.03] tracking-[-.045em] md:text-7xl">Turn back-office data into <span className="bg-gradient-to-r from-violet to-mint bg-clip-text text-transparent">investor-ready diligence.</span></h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">Flowlie Raise Readiness Copilot analyzes startup financials, legal records, ownership, pipeline, and meeting notes—then turns the gaps into a clear founder action plan.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/demo" className="button">Run the AtlasAI demo <ArrowRight size={16}/></Link><Link href="/dashboard" className="button-secondary">View dashboard</Link></div>
      </div>
      <div className="mt-20 grid gap-4 md:grid-cols-3">{features.map(([Icon, title, text]) => <article className="card p-6" key={title}><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-mint"><Icon size={20}/></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div>
      <div className="card mt-6 grid gap-8 p-7 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div><Database className="text-violet"/><h3 className="mt-3 font-semibold">Synthetic evidence</h3><p className="mt-2 text-sm text-slate-500">CSV, JSON, and meeting notes</p></div>
        <ArrowRight className="hidden text-slate-700 md:block"/>
        <div><Bot className="text-mint"/><h3 className="mt-3 font-semibold">Deterministic engines</h3><p className="mt-2 text-sm text-slate-500">Rules, templates, classification</p></div>
        <ArrowRight className="hidden text-slate-700 md:block"/>
        <div><CheckCircle2 className="text-amber-300"/><h3 className="mt-3 font-semibold">Founder output</h3><p className="mt-2 text-sm text-slate-500">Risks, Q&A, seven-day plan</p></div>
      </div>
    </section>
  </main>;
}
