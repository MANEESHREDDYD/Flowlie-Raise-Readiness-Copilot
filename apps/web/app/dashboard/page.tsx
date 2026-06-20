"use client";

import { AppLayout } from "@/components/Layout";
import { CompanyDashboard } from "@/components/CompanyDashboard";
import { EmptyState } from "@/components/EmptyState";
import { CompanySummary } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function DashboardPage() {
  const {data,loading}=useApi<CompanySummary[]>("/companies/summary");
  if(loading)return <AppLayout><p className="muted">Loading AtlasAI…</p></AppLayout>;
  const atlas=data?.find(company=>company.name==="AtlasAI");
  return <AppLayout>{atlas?<CompanyDashboard companyId={atlas.id}/>:<EmptyState title="AtlasAI is not seeded" description="Open Demo controls to seed AtlasAI or the full company portfolio."/>}</AppLayout>;
}
