"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Loader2, Play, RotateCcw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";

type Status={seeded:boolean;seeded_count:number;company_id:number|null;company_names:string[]};

export default function DemoPage(){
  const{data,refresh}=useApi<Status>("/demo/status");const[running,setRunning]=useState("");const[message,setMessage]=useState("");
  const call=async(path:string,label:string)=>{setRunning(path);setMessage("");try{await api(path,{method:"POST"});setMessage(label);await refresh()}catch(err){setMessage(err instanceof Error?err.message:"Demo action failed")}finally{setRunning("")}};
  return <AppLayout><PageHeader eyebrow="Synthetic portfolio controls" title="Demo data" description="Seed AtlasAI alone or load five distinct startups with generated scores, risks, Q&A, and action plans." action={<Link href="/companies" className="button-secondary"><Building2 size={16}/> Open portfolio</Link>}/>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="card p-7"><div className="flex gap-3"><span className="rounded-xl bg-violet/15 p-3 text-violet"><Sparkles/></span><div><h2 className="text-xl font-semibold">Choose a demo mode</h2><p className="mt-1 text-sm text-slate-400">Seeding runs the complete deterministic analysis pipeline.</p></div></div><div className="mt-7 flex flex-wrap gap-3"><button className="button" disabled={!!running} onClick={()=>call("/demo/seed-atlasai","AtlasAI is ready.")}>{running==="/demo/seed-atlasai"?<Loader2 className="animate-spin" size={16}/>:<Play size={16}/>} Seed AtlasAI only</button><button className="button-secondary" disabled={!!running} onClick={()=>call("/demo/seed-all","All five demo companies are ready.")}>{running==="/demo/seed-all"?<Loader2 className="animate-spin" size={16}/>:<Building2 size={16}/>} Seed all companies</button><button className="button-secondary" disabled={!!running} onClick={()=>call("/demo/reset","Synthetic demo companies reset; user companies were preserved.")}><RotateCcw size={16}/> Reset demo data</button></div>{message&&<p className="mt-5 rounded-xl bg-white/5 p-4 text-sm text-slate-300">{message}</p>}</section><section className="card p-7"><p className="eyebrow">Current demo state</p><p className="mt-3 text-4xl font-semibold">{data?.seeded_count||0}</p><p className="text-sm text-slate-500">synthetic companies seeded</p><div className="mt-5 flex flex-wrap gap-2">{data?.company_names?.map(name=><span className="rounded-full bg-white/5 px-3 py-1 text-xs" key={name}>{name}</span>)}</div>{data?.seeded&&<Link href="/companies" className="mt-6 inline-flex text-sm font-semibold text-mint">View company portfolio →</Link>}</section></div>
  </AppLayout>;
}
