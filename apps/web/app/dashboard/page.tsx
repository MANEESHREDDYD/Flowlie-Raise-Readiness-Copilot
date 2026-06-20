"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/Layout";
import { EmptyState } from "@/components/EmptyState";
import { CompanySummary } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function DashboardPage() {
  const router = useRouter();
  const {data,loading}=useApi<CompanySummary[]>("/companies/summary");
  const atlas=data?.find(company=>company.name==="AtlasAI");
  useEffect(() => {
    if (atlas) router.replace(`/companies/${atlas.id}/dashboard`);
  }, [atlas, router]);
  if(loading)return <AppLayout><p className="muted">Loading AtlasAI…</p></AppLayout>;
  return <AppLayout>{atlas?<p className="muted">Opening AtlasAI dashboard…</p>:<EmptyState title="AtlasAI is not seeded" description="Open Demo controls to seed AtlasAI or the full company portfolio."/>}</AppLayout>;
}
