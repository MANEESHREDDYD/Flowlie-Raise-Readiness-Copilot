from .data_room_engine import build_data_room, data_room_score
from .financial_engine import financial_summary
from ..utils.scoring import clamp


def readiness_tier(score: float) -> str:
    if score >= 90:
        return "Investor-ready"
    if score >= 75:
        return "Mostly ready"
    if score >= 60:
        return "Needs cleanup"
    if score >= 40:
        return "Not diligence-ready"
    return "High-risk raise preparation"


def finance_score(metrics) -> float:
    if not metrics:
        return 0
    summary = financial_summary(metrics)
    score = 100
    runway = summary["runway_months"]
    if runway < 12:
        score -= 15
    if runway < 9:
        score -= 10
    if runway < 6:
        score -= 15
    if summary["gross_margin_change"] < -0.10:
        score -= 15
    if summary["burn_increase_percent"] > 30:
        score -= 10
    if summary["revenue_growth_percent"] <= 0:
        score -= 15
    return clamp(score)


def compliance_score(items) -> float:
    if not items:
        return 0
    status = {item.item.lower(): item.status for item in items}
    score = 100
    if status.get("boi filing") == "missing":
        score -= 20
    if status.get("409a valuation") == "missing":
        score -= 20
    if status.get("contractor ip assignments") == "missing":
        score -= 25
    if status.get("state foreign qualification") == "needs_review":
        score -= 10
    if status.get("business insurance") == "missing":
        score -= 15
    return clamp(score)


def cap_table_score(entries) -> float:
    if not entries:
        return 0
    score = 100
    if any(entry.type.lower() == "safe" and entry.ownership_percent is None for entry in entries):
        score -= 20
    if any(entry.shares is None and not (entry.notes or "").strip() for entry in entries):
        score -= 10
    option_pool = sum(entry.ownership_percent or 0 for entry in entries if entry.type.lower() == "option_pool")
    if option_pool < 10:
        score -= 10
    founder_ownership = sum(
        entry.ownership_percent or 0 for entry in entries if entry.is_founder
    )
    if founder_ownership < 50:
        score -= 15
    return clamp(score)


def pipeline_score(records) -> float:
    if not records:
        return 0
    score = 100
    concentrations = sorted((record.revenue_concentration for record in records), reverse=True)
    if concentrations and concentrations[0] > 0.30:
        score -= 20
    if sum(concentrations[:2]) > 0.60:
        score -= 20
    if not any(record.probability > 0.50 for record in records):
        score -= 15
    if any(not record.expected_close_month for record in records):
        score -= 10
    return clamp(score)


def meeting_score(documents, metrics, generated_questions_count: int = 0) -> float:
    meeting_docs = [doc for doc in documents if doc.document_type in {"investor_meeting", "investor_process"}]
    if not meeting_docs:
        return 0
    score = 100
    transcript = " ".join(doc.extracted_text.lower() for doc in meeting_docs)
    types = {doc.document_type for doc in documents if doc.status == "present"}
    if "asked" in transcript and generated_questions_count == 0:
        score -= 20
    if ("use-of-funds" in transcript or "use of funds" in transcript) and "use_of_funds" not in types:
        score -= 20
    if "ip" in transcript and "contractor_ip" not in types:
        score -= 20
    if "runway" in transcript and metrics and financial_summary(metrics)["runway_months"] < 12:
        score -= 10
    return clamp(score)


def missing_inputs(documents, metrics, compliance, cap_table, pipeline, headcount) -> list[str]:
    values = {
        "financial metrics": metrics,
        "cap table": cap_table,
        "compliance checklist": compliance,
        "headcount": headcount,
        "customer pipeline": pipeline,
        "documents or notes": documents,
    }
    return [label for label, rows in values.items() if not rows]


def calculate_readiness(
    company, documents, metrics, compliance, cap_table, pipeline, headcount=None,
    generated_questions_count=0,
) -> dict:
    headcount = headcount or []
    checklist = build_data_room(documents, compliance)
    scores = {
        "finance_score": finance_score(metrics),
        "data_room_score": data_room_score(checklist),
        "compliance_score": compliance_score(compliance),
        "cap_table_score": cap_table_score(cap_table),
        "pipeline_score": pipeline_score(pipeline),
        "meeting_score": meeting_score(documents, metrics, generated_questions_count),
    }
    overall = (
        scores["finance_score"] * 0.25
        + scores["data_room_score"] * 0.25
        + scores["compliance_score"] * 0.20
        + scores["cap_table_score"] * 0.15
        + scores["pipeline_score"] * 0.10
        + scores["meeting_score"] * 0.05
    )
    missing = missing_inputs(documents, metrics, compliance, cap_table, pipeline, headcount)
    scores["overall_score"] = round(overall, 1)
    scores["readiness_tier"] = readiness_tier(scores["overall_score"])
    scores["missing_inputs"] = missing
    scores["summary"] = (
        f"{company.name} has a partial readiness assessment. Add {', '.join(missing)} for a fuller result."
        if missing else
        f"{company.name} has a source-backed readiness assessment across finance, data room, compliance, ownership, pipeline, and investor follow-up."
    )
    return scores
