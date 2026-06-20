"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/components/Layout";
import { CompanyDashboard } from "@/components/CompanyDashboard";

export default function CompanyDashboardPage() {
  const { id } = useParams<{ id: string }>();
  return <AppLayout><CompanyDashboard companyId={id}/></AppLayout>;
}
