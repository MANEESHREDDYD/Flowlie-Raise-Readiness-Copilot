"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { runAnalysis } from "@/lib/api";

export default function RunAnalysisPage() {
  const {id}=useParams<{id:string}>();const started=useRef(false);
  const [state,setState]=useState<"running"|"done"|"error">("running");const [message,setMessage]=useState("Generating risks…");
  useEffect(()=>{if(started.current)return;started.current=true;(async()=>{try{setMessage("Generating risks, investor Q&A, strict score, and action plan…");await runAnalysis(Number(id));setState("done");setMessage("Analysis complete and persisted in SQLite.");}catch(err){setState("error");setMessage(err instanceof Error?err.message:"Analysis failed");}})()},[id]);
  return <AppLayout><PageHeader eyebrow="Deterministic workflow" title="Run company analysis" description="The same local rules work for demo companies and user-entered evidence."/>
    <div className="card mx-auto max-w-2xl p-10 text-center">{state==="running"?<Loader2 className="mx-auto animate-spin text-mint" size={38}/>:state==="done"?<CheckCircle2 className="mx-auto text-mint" size={42}/>:<div className="mx-auto text-3xl text-rose-300">!</div>}<h2 className="mt-5 text-xl font-semibold">{state==="running"?"Analyzing company":state==="done"?"Analysis complete":"Analysis could not complete"}</h2><p className="mt-3 text-sm text-slate-400">{message}</p>{state==="done"&&<Link href={`/companies/${id}/dashboard`} className="button mt-6">Open dashboard</Link>}{state==="error"&&<Link href={`/companies/${id}/edit-data`} className="button-secondary mt-6">Review company data</Link>}</div>
  </AppLayout>;
}
