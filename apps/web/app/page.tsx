import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Database, FileSearch, Gauge, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  [Gauge, "Strict score + recovery", "An honest weighted baseline plus an evidence-backed path showing which cleanup actions can improve it."],
  [FileSearch, "Source-backed preparation notes", "Investor questions and operator-review answer drafts grounded in named evidence, without unsupported claims."],
  [ShieldCheck, "Diligence concern triage", "Deterministic flags for runway, margin, IP, compliance, cap table, and customer concentration."],
] as const;

export default function Landing() {
  return <main className="min-h-screen overflow-hidden">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-3 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-slate-950"><Sparkles size={18}/></span>Flowlie <span className="hidden text-slate-500 sm:inline">/ Raise Readiness Copilot</span></div>
      <Link href="/demo" className="button-secondary">Launch demo <ArrowRight size={15}/></Link>
    </nav>
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
      <div className="max-w-4xl">
        <p className="eyebrow">Local-first feature prototype</p>
        <h1 className="mt-5 text-5xl font-semibold leading-[1.03] tracking-[-.045em] md:text-7xl">Operator-reviewed evidence <span className="bg-gradient-to-r from-violet to-mint bg-clip-text text-transparent">intelligence for fundraising.</span></h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">An internal evidence-intake module for an embedded back-office team. It reviews founder-provided financials, legal records, ownership, pipeline, and meeting notes, then turns the gaps into a draft cleanup queue for operator review—not legal, tax, investment, or accounting advice.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/demo" className="button">Run the AtlasAI demo <ArrowRight size={16}/></Link><Link href="/companies" className="button-secondary">Open operator portfolio</Link></div>
      </div>
      <div className="mt-20 grid gap-4 md:grid-cols-3">{features.map(([Icon, title, text]) => <article className="card p-6" key={title}><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-mint"><Icon size={20}/></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div>
      <div className="card mt-6 grid gap-8 p-7 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div><Database className="text-violet"/><h3 className="mt-3 font-semibold">Synthetic evidence</h3><p className="mt-2 text-sm text-slate-500">CSV, JSON, and meeting notes</p></div>
        <ArrowRight className="hidden text-slate-700 md:block"/>
        <div><Bot className="text-mint"/><h3 className="mt-3 font-semibold">Deterministic engines</h3><p className="mt-2 text-sm text-slate-500">Rules, templates, classification</p></div>
        <ArrowRight className="hidden text-slate-700 md:block"/>
        <div><CheckCircle2 className="text-amber-300"/><h3 className="mt-3 font-semibold">Operator-review drafts</h3><p className="mt-2 text-sm text-slate-500">Concerns, prep notes, cleanup queue</p></div>
      </div>
    </section>
    <footer className="mx-auto max-w-7xl px-6 pb-8 text-sm text-slate-500">
      Flowlie Raise Readiness Copilot turns founder-provided evidence into draft diligence-preparation artifacts for operator review. All demo data is synthetic and every generated output is a draft requiring operator review. It does not provide legal, tax, accounting, investment, or fundraising advice.
    </footer>
  </main>;
}
