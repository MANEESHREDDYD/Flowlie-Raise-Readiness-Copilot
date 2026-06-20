export type Company = {
  id: number; name: string; industry: string; stage: string; target_raise: number;
  cash_balance: number; monthly_burn: number; current_arr: number; team_size: number;
  employees: number; contractors: number; primary_market: string; fundraise_goal: string;
};
export type ReviewStatus = "draft" | "needs_review" | "reviewed";
export type Readiness = {
  overall_score: number; finance_score: number; data_room_score: number; compliance_score: number;
  cap_table_score: number; pipeline_score: number; meeting_score: number; summary: string; readiness_tier: string;
  review_status?: ReviewStatus;
};
export type Risk = {
  id: number; category: string; severity: string; title: string; evidence: string;
  business_impact: string; why_matters_to_investors: string; suggested_fix: string; status: string; review_status?: ReviewStatus;
  evidence_quality?: string; operator_note?: string; founder_facing_note?: string; reviewed_by?: string; reviewed_at?: string;
};
export type Financial = {
  month: string; revenue: number; expenses: number; cash_balance: number; burn: number; gross_margin: number;
};
export type FinancialSummary = {
  months_analyzed: number;
  latest_revenue: number;
  latest_burn: number;
  latest_cash_balance: number;
  runway_months: number;
  revenue_growth_percent: number;
  burn_increase_percent: number;
  gross_margin_change: number;
};

export type ConfidenceComponent = {
  component: string;
  score: number;
  confidence: string;
  evidence_coverage: number;
  structured_records_count: number;
  unknown_evidence_count: number;
  needs_review_count: number;
  reason: string;
  limitations: string[];
};

export type ConfidenceAudit = {
  company_id: number;
  overall_confidence: string;
  components: ConfidenceComponent[];
  unknown_evidence_count: number;
  needs_review_count: number;
};
export type DataRoomItem = { key: string; name: string; category: string; status: string };
export type ActionItem = { id: number; title: string; priority: string; owner: string; due_date: string; category: string; status: string; estimated_score_lift: number; review_status?: ReviewStatus; evidence_quality?: string; operator_note?: string; founder_facing_note?: string; reviewed_by?: string; reviewed_at?: string; };
export type Question = { id: number; question: string; suggested_answer: string; source: string; missing_evidence: string; confidence: number; category: string; review_status?: ReviewStatus; evidence_quality?: string; };
export type RecoveryAction = { action: string; estimated_score_lift: number; score_basis: string; source_evidence: string };
export type RecoveryPath = {
  current_strict_score: number; current_tier: string; estimated_strict_score_lift: number;
  projected_strict_score: number; projected_range_low: number; projected_range_high: number;
  projected_tier: string; actions: RecoveryAction[]; methodology: string;
};
export type CompanySummary = {
  id: number; name: string; stage: string; industry: string; score: number | null;
  tier: string; review_status: ReviewStatus; top_risk: string; risk_count: number; open_action_items: number;
  created_at: string; is_demo: boolean;
};
export type CapEntry = { id: number; holder: string; type: string; is_founder: boolean; ownership_percent: number | null; shares: number | null; notes: string | null };
export type Headcount = { id: number; name: string; role: string; type: string; start_date: string; ip_assignment_signed: boolean; monthly_cost: number };
export type Pipeline = { id: number; customer: string; stage: string; contract_value: number; probability: number; expected_close_month: string; revenue_concentration: number };
export type Compliance = { id: number; item: string; status: string; last_updated: string | null; owner: string };
export type DocumentRecord = { id: number; file_name: string; document_type: string; category: string; status: string; extracted_text: string; evidence_quality?: string; review_status?: ReviewStatus; };
