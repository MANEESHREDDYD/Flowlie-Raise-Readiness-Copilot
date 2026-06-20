"use client";

import { useParams } from "next/navigation";
import { CompanyDataRoom } from "@/components/CompanyViews";

export default function DataRoomPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyDataRoom companyId={id}/>;
}
