"use client";

import { useParams } from "next/navigation";
import { CompanyFinancials } from "@/components/CompanyViews";

export default function FinancialsPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyFinancials companyId={id}/>;
}
