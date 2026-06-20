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
    strong: "bg-white/10 text-white border border-white/20",
    partial: "bg-[#222] text-[#ccc] border border-borderDark",
    weak: "bg-[#1a1a1a] text-[#888] border border-borderDark",
    unknown: "bg-[#111] text-[#555] border border-borderDark",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto bg-[#000]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Confidence Audit</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest ${colorMap[audit.overall_confidence as keyof typeof colorMap]}`}>
                Overall: {audit.overall_confidence}
              </span>
              <span className="text-[12px] font-medium text-[#888] bg-[#111] border border-borderDark px-2 py-1 rounded-md">
                · heuristic estimate
              </span>
            </div>
          </div>

          <p className="text-[#888] leading-6 text-sm max-w-2xl">
            This module evaluates the structural integrity of the uploaded evidence. The system is designed to expose uncertainty, not hide it.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-[11px] uppercase tracking-widest text-[#666] font-semibold">Unclassified Evidence</p>
              <p className="text-3xl font-semibold tracking-tight text-white mt-2">{audit.unknown_evidence_count} documents</p>
            </div>
            <div className="card p-5">
              <p className="text-[11px] uppercase tracking-widest text-[#666] font-semibold">Operator Review Queue</p>
              <p className="text-3xl font-semibold tracking-tight text-white mt-2">{audit.needs_review_count} items</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold tracking-tight text-white">Component Breakdown</h2>
            <div className="grid gap-4">
              {audit.components.map((comp: any) => (
                <div key={comp.component} className="card p-6 flex flex-col gap-5 hover:bg-[#111] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-white">{comp.component}</h3>
                      <p className="text-sm text-[#888] mt-2">{comp.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#888] bg-[#1a1a1a] border border-borderDark px-2 py-1 rounded-md">
                        · heuristic estimate
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest ${colorMap[comp.confidence as keyof typeof colorMap]}`}>
                        {comp.confidence}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-[13px] text-[#666] font-medium border-t border-borderDark pt-4 mt-1">
                    <div className="flex items-center gap-2">
                      Coverage: <span className="font-semibold text-[#dedede]">{Math.round(comp.evidence_coverage * 100)}%</span>
                    </div>
                    <div>Structured Records: <span className="font-semibold text-[#dedede]">{comp.structured_records_count}</span></div>
                    {comp.unknown_evidence_count > 0 && (
                      <div className="text-amber-500/80">Unclassified: {comp.unknown_evidence_count}</div>
                    )}
                  </div>

                  {comp.limitations.length > 0 && (
                    <div className="mt-2 bg-[#0a0a0a] p-4 rounded-lg border border-borderDark">
                      <p className="text-[10px] font-semibold text-[#555] uppercase tracking-widest mb-3">Known Limitations</p>
                      <ul className="list-disc pl-5 space-y-2 text-[13px] leading-5 text-[#888]">
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
        </div>
      </main>
    </div>
  );
}
