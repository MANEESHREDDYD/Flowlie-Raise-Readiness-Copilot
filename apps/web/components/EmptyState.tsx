import Link from "next/link";
import { Sparkles } from "lucide-react";

export function EmptyState({ title = "Demo data is not ready", description = "Seed and analyze AtlasAI to populate this view." }: { title?: string; description?: string }) {
  return <div className="card grid min-h-72 place-items-center p-10 text-center"><div><Sparkles className="mx-auto text-mint"/><h2 className="mt-4 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-400">{description}</p><Link href="/demo" className="button mt-5">Open demo controls</Link></div></div>;
}
