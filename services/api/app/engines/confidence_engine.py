from .. import models


def calculate_confidence(
    company: models.Company,
    metrics: list[models.FinancialMetric],
    cap_table: list[models.CapTableEntry],
    headcount: list[models.HeadcountRecord],
    pipeline: list[models.CustomerPipelineRecord],
    compliance: list[models.ComplianceItem],
    documents: list[models.Document],
    readiness_score: models.ReadinessScore | None,
) -> dict:
    components = []
    
    # Analyze total documents for global unknown/needs_review counts
    global_unknown_docs = sum(1 for d in documents if d.document_type == "unknown")
    global_needs_review_docs = sum(1 for d in documents if d.review_status == "needs_review")

    # Finance Component
    finance_score = readiness_score.finance_score if readiness_score else 0.0
    fin_docs = [d for d in documents if d.category == "Finance"]
    unknown_fin = sum(1 for d in fin_docs if d.document_type == "unknown")
    review_fin = sum(1 for d in fin_docs if d.review_status == "needs_review")
    
    if len(metrics) >= 3:
        has_burn = all(m.burn > 0 for m in metrics)
        has_cash = all(m.cash_balance >= 0 for m in metrics)
        if has_burn and has_cash:
            conf, reason = "strong", "Monthly financials include revenue, burn, cash balance, and gross margin for several periods."
            limitations = ["No department-level expense breakdown."]
            coverage = 0.9
        else:
            conf, reason = "partial", "Monthly financials exist but lack some required fields like burn or cash balance."
            limitations = ["Incomplete burn/cash history."]
            coverage = 0.5
    elif len(metrics) > 0:
        conf, reason = "partial", "Some structured financials exist, but not enough periods for full confidence."
        limitations = ["Needs at least 3-6 months of historical data."]
        coverage = 0.4
    elif len(fin_docs) > 0:
        conf, reason = "weak", "Only unstructured financial documents exist. Needs structured input."
        limitations = ["Cannot compute quantitative runway/burn without structured data."]
        coverage = 0.2
    else:
        conf, reason = "unknown", "No financial evidence provided."
        limitations = ["Complete financial data is missing."]
        coverage = 0.0

    if unknown_fin > 0 and conf != "unknown":
        conf = "partial" if conf == "strong" else conf
        limitations.append("Contains unclassified documents that may impact financial scoring.")

    components.append({
        "component": "Finance",
        "score": finance_score,
        "confidence": conf,
        "evidence_coverage": coverage,
        "structured_records_count": len(metrics),
        "unknown_evidence_count": unknown_fin,
        "needs_review_count": review_fin,
        "reason": reason,
        "limitations": limitations
    })

    # Cap Table Component
    cap_score = readiness_score.cap_table_score if readiness_score else 0.0
    cap_docs = [d for d in documents if d.category == "Ownership"]
    unknown_cap = sum(1 for d in cap_docs if d.document_type == "unknown")
    review_cap = sum(1 for d in cap_docs if d.review_status == "needs_review")

    has_safes = any(e.type.lower() == "safe" for e in cap_table)
    
    if len(cap_table) > 0:
        if has_safes:
            conf, reason = "partial", "Structured cap table exists, but SAFE conversion terms are not modeled."
            limitations = ["SAFE conversion details missing. Fully diluted ownership is estimated."]
            coverage = 0.6
        else:
            conf, reason = "strong", "Structured cap table exists with clear ownership percentages."
            limitations = ["Does not verify underlying legal issuance documents."]
            coverage = 0.9
    elif len(cap_docs) > 0:
        conf, reason = "weak", "Cap table exists as unstructured document. Needs parsing."
        limitations = ["Ownership calculations cannot be verified automatically."]
        coverage = 0.2
    else:
        conf, reason = "unknown", "No cap table evidence provided."
        limitations = ["Complete ownership data is missing."]
        coverage = 0.0

    if unknown_cap > 0 and conf != "unknown":
        conf = "partial" if conf == "strong" else conf
        limitations.append("Unclassified documents in ownership category.")

    components.append({
        "component": "Cap Table",
        "score": cap_score,
        "confidence": conf,
        "evidence_coverage": coverage,
        "structured_records_count": len(cap_table),
        "unknown_evidence_count": unknown_cap,
        "needs_review_count": review_cap,
        "reason": reason,
        "limitations": limitations
    })

    # Compliance Component
    comp_score = readiness_score.compliance_score if readiness_score else 0.0
    comp_docs = [d for d in documents if d.category == "Legal & compliance"]
    unknown_comp = sum(1 for d in comp_docs if d.document_type == "unknown")
    review_comp = sum(1 for d in comp_docs if d.review_status == "needs_review")

    if len(compliance) >= 3:
        conf, reason = "strong", "Multiple structured compliance checklist items are tracked."
        limitations = ["Does not verify actual legal validity of compliance documents."]
        coverage = 0.8
    elif len(compliance) > 0:
        conf, reason = "partial", "Some structured compliance items tracked, but coverage is low."
        limitations = ["Missing tracking for standard compliance requirements (e.g. BOI, 409A)."]
        coverage = 0.4
    elif len(comp_docs) > 0:
        conf, reason = "weak", "Only unstructured compliance documents exist. No structured tracking."
        limitations = ["Cannot automatically verify expiration dates or status."]
        coverage = 0.2
    else:
        conf, reason = "unknown", "No compliance evidence provided."
        limitations = ["No compliance data found."]
        coverage = 0.0

    if unknown_comp > 0 and conf != "unknown":
        conf = "partial" if conf == "strong" else conf
        limitations.append("Unclassified compliance documents need operator mapping.")

    components.append({
        "component": "Compliance",
        "score": comp_score,
        "confidence": conf,
        "evidence_coverage": coverage,
        "structured_records_count": len(compliance),
        "unknown_evidence_count": unknown_comp,
        "needs_review_count": review_comp,
        "reason": reason,
        "limitations": limitations
    })

    # Data Room / Documents Component
    dr_score = readiness_score.data_room_score if readiness_score else 0.0
    unknown_dr = sum(1 for d in documents if d.document_type == "unknown")
    review_dr = sum(1 for d in documents if d.review_status == "needs_review")

    if len(documents) > 5 and unknown_dr == 0:
        conf, reason = "strong", "Rich data room with multiple classified documents and no unknown files."
        limitations = ["Quality of underlying document contents still requires manual audit."]
        coverage = 0.9
    elif len(documents) > 0:
        if unknown_dr > 0:
            conf, reason = "partial", f"Data room exists but contains {unknown_dr} unclassified documents."
            limitations = ["Unclassified documents cannot be used to reliably satisfy data room gaps."]
            coverage = 0.5
        else:
            conf, reason = "partial", "Data room exists but is sparse."
            limitations = ["Missing standard fundraising materials."]
            coverage = 0.4
    else:
        conf, reason = "unknown", "Data room is empty."
        limitations = ["No files uploaded."]
        coverage = 0.0

    components.append({
        "component": "Data Room",
        "score": dr_score,
        "confidence": conf,
        "evidence_coverage": coverage,
        "structured_records_count": 0,
        "unknown_evidence_count": unknown_dr,
        "needs_review_count": review_dr,
        "reason": reason,
        "limitations": limitations
    })

    # Overall Confidence Calculation
    confidence_levels = [c["confidence"] for c in components]
    if "unknown" in confidence_levels:
        overall = "unknown"
    elif "weak" in confidence_levels:
        overall = "weak"
    elif "partial" in confidence_levels:
        overall = "partial"
    else:
        overall = "strong"

    return {
        "company_id": company.id,
        "overall_confidence": overall,
        "components": components,
        "unknown_evidence_count": global_unknown_docs,
        "needs_review_count": global_needs_review_docs
    }
