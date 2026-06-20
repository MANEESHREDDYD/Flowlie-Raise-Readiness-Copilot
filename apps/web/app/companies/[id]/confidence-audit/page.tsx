import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

async function getConfidenceAudit(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/companies/${id}/confidence-audit`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ConfidenceAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const audit = await getConfidenceAudit(resolvedParams.id);
  if (!audit) return notFound();

  const colorMap = {
    strong: "bg-green-100 text-green-800",
    partial: "bg-yellow-100 text-yellow-800",
    weak: "bg-orange-100 text-orange-800",
    unknown: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Confidence Audit</h1>
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${colorMap[audit.overall_confidence as keyof typeof colorMap]}`}>
                Overall: {audit.overall_confidence}
              </span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                · heuristic estimate
              </span>
            </div>
          </div>

          <p className="text-gray-600">
            This module evaluates the structural integrity of the uploaded evidence. The system is designed to expose uncertainty, not hide it.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Unclassified Evidence</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{audit.unknown_evidence_count} documents</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Operator Review Queue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{audit.needs_review_count} items</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pt-4">Component Breakdown</h2>
            {audit.components.map((comp: any) => (
              <div key={comp.component} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{comp.component}</h3>
                    <p className="text-sm text-gray-600 mt-1">{comp.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      · heuristic estimate
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorMap[comp.confidence as keyof typeof colorMap]}`}>
                      {comp.confidence}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    Coverage: <span className="font-semibold text-gray-900">{Math.round(comp.evidence_coverage * 100)}%</span>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">· heuristic estimate</span>
                  </div>
                  <div>Structured Records: <span className="font-semibold text-gray-900">{comp.structured_records_count}</span></div>
                  {comp.unknown_evidence_count > 0 && (
                    <div className="text-orange-600">Unclassified: {comp.unknown_evidence_count}</div>
                  )}
                </div>

                {comp.limitations.length > 0 && (
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Known Limitations</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {comp.limitations.map((lim: string, i: number) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
