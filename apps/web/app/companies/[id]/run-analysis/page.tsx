"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { DraftNotice } from "@/components/DraftNotice";
import { PageHeader } from "@/components/PageHeader";
import { runAnalysis } from "@/lib/api";

export default function RunAnalysisPage() {
  const {id}=useParams<{id:string}>();const started=useRef(false);
  const [state,setState]=useState<"running"|"done"|"error">("running");const [message,setMessage]=useState("Generating risks…");
  useEffect(()=>{if(started.current)return;started.current=true;(async()=>{try{setMessage("Generating risks, investor Q&A, strict score, and action plan…");await runAnalysis(Number(id));setState("done");setMessage("Analysis complete and persisted in SQLite.");}catch(err){setState("error");setMessage(err instanceof Error?err.message:"Analysis failed");}})()},[id]);
  return <AppLayout><PageHeader eyebrow="Operator review workflow" title="Run evidence analysis" description="The same deterministic rules run on demo companies and operator-entered evidence. Outputs are drafts for operator review."/>
    <div className="mx-auto max-w-2xl"><div className="mb-6"><DraftNotice/></div>
    <div className="card p-10 text-center">{state==="running"?<Loader2 className="mx-auto animate-spin text-mint" size={38}/>:state==="done"?<CheckCircle2 className="mx-auto text-mint" size={42}/>:<div className="mx-auto text-3xl text-rose-300">!</div>}<h2 className="mt-5 text-xl font-semibold">{state==="running"?"Analyzing evidence":state==="done"?"Draft analysis complete":"Analysis could not complete"}</h2><p className="mt-3 text-sm text-slate-400">{message}</p>{state==="done"&&<p className="mt-3 text-xs text-amber-200">Draft output — requires operator review.</p>}{state==="done"&&<Link href={`/companies/${id}/dashboard`} className="button mt-6">Open dashboard</Link>}{state==="error"&&<Link href={`/companies/${id}/edit-data`} className="button-secondary mt-6">Review company data</Link>}</div></div>
  </AppLayout>;
}
