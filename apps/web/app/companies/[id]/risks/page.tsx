"use client";

import { useParams } from "next/navigation";
import { CompanyRisks } from "@/components/CompanyViews";

export default function RisksPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyRisks companyId={id}/>;
}
