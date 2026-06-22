"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useApi } from "@/lib/useApi";

type Health = { status: string };

export function ApiHealthBanner() {
  const { error, loading, refresh } = useApi<Health>("/health");
  if (loading || !error) return null;

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={19}/>
        <div>
          <p className="font-semibold">Backend API is offline</p>
          <p className="mt-1 leading-6 text-amber-100/70">
            Start both services from the repository root with <code className="rounded bg-black/30 px-1.5 py-0.5">npm run dev</code>.
            The frontend is running, but demo data and analysis require FastAPI on port 8000.
          </p>
        </div>
      </div>
      <button className="button-secondary shrink-0" onClick={() => refresh()}>
        <RefreshCw size={15}/> Retry connection
      </button>
    </div>
  );
}
