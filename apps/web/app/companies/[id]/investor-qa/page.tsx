"use client";

import { useParams } from "next/navigation";
import { CompanyInvestorQa } from "@/components/CompanyViews";

export default function InvestorQaPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyInvestorQa companyId={id}/>;
}
