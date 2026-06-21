export const API_URL = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function apiBaseUrl() {
  return typeof window === "undefined" ? API_URL : BROWSER_API_URL;
}

function connectionError(path: string, cause?: unknown) {
  const detail = cause instanceof Error ? ` (${cause.message})` : "";
  return new Error(
    `Backend API is unavailable for ${path}. Start the complete app from the repository root with "npm run dev", then retry.${detail}`
  );
}

async function request(path: string, init?: RequestInit) {
  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
    });
  } catch (error) {
    throw connectionError(path, error);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    if (response.status >= 500) throw connectionError(path);
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function upload<T>(path: string, formData: FormData): Promise<T> {
  const response = await request(path, { method: "POST", body: formData });
  if (!response.ok) {
    const detail = await response.text();
    if (response.status >= 500) throw connectionError(path);
    throw new Error(detail || `Upload failed (${response.status})`);
  }
  return response.json();
}

export const diligenceReportUrl = (companyId: number) =>
  `${BROWSER_API_URL}/companies/${companyId}/diligence-report.md`;

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
