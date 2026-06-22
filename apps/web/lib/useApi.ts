"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useApi<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setData(await api<T>(path));
      setError(null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh };
}
