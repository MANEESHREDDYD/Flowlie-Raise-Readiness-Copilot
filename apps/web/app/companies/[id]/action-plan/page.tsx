"use client";

import { useParams } from "next/navigation";
import { CompanyActionPlan } from "@/components/CompanyViews";

export default function ActionPlanPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyActionPlan companyId={id}/>;
}
