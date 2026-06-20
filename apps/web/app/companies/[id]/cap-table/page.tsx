"use client";

import { useParams } from "next/navigation";
import { CompanyCapTable } from "@/components/CompanyViews";

export default function CapTablePage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyCapTable companyId={id}/>;
}
