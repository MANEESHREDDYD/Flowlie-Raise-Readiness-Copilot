"use client";

import { useParams } from "next/navigation";
import { CompanyCompliance } from "@/components/CompanyViews";

export default function CompliancePage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyCompliance companyId={id}/>;
}
