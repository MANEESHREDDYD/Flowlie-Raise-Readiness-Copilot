export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function upload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { method: "POST", body: formData });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const diligenceReportUrl = (companyId: number) =>
  `${API_URL}/companies/${companyId}/diligence-report.md`;

export async function runDemoPipeline() {
  const seed = await api<{company_id: number}>("/demo/seed", { method: "POST" });
  const id = seed.company_id;
  await api(`/companies/${id}/risks/generate`, { method: "POST" });
  await api(`/companies/${id}/investor-qa/generate`, { method: "POST" });
  await api(`/companies/${id}/readiness/run`, { method: "POST" });
  await api(`/companies/${id}/action-plan/generate`, { method: "POST" });
  return id;
}

export async function runAnalysis(companyId: number) {
  await api(`/companies/${companyId}/risks/generate`, { method: "POST" });
  await api(`/companies/${companyId}/investor-qa/generate`, { method: "POST" });
  await api(`/companies/${companyId}/readiness/run`, { method: "POST" });
  await api(`/companies/${companyId}/action-plan/generate`, { method: "POST" });
}
