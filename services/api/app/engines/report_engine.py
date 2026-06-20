from datetime import date

from .data_room_engine import build_data_room
from .financial_engine import financial_summary
from .readiness_engine import readiness_tier
from .recovery_engine import build_recovery_path


def _money(value: float) -> str:
    return f"${value:,.0f}"


def build_diligence_report(
    company,
    score,
    documents,
    metrics,
    compliance,
    risks,
    questions,
    actions,
    cap_table=None,
    headcount=None,
    pipeline=None,
) -> str:
    summary = financial_summary(metrics)
    checklist = build_data_room(documents, compliance)
    recovery = build_recovery_path(score.overall_score, actions)
    lines = [
        f"# {company.name} - Diligence Readiness Report",
        "",
        f"_Generated locally on {date.today().isoformat()} from synthetic evidence._",
        "",
        "> Prototype preparation output only. This report does not provide legal, tax, investment, accounting, or financial advice.",
        "",
        "## Executive summary",
        "",
        f"- **Strict Raise Readiness Score:** {score.overall_score:.1f}/100",
        f"- **Readiness tier:** {readiness_tier(score.overall_score)}",
        f"- **Projected after priority cleanup:** {recovery['projected_range_low']:.0f}–{recovery['projected_range_high']:.0f}/100 ({recovery['projected_tier']})",
        f"- **Runway:** {summary['runway_months']:.1f} months",
        f"- **Cash balance:** {_money(summary['latest_cash_balance'])}",
        f"- **Monthly burn:** {_money(summary['latest_burn'])}",
        f"- **Open risks:** {len(risks)}",
        "",
        score.summary,
        "",
        "## Strict score breakdown",
        "",
        "| Component | Score | Weight |",
        "| --- | ---: | ---: |",
        f"| Finance | {score.finance_score:.1f} | 25% |",
        f"| Data room | {score.data_room_score:.1f} | 25% |",
        f"| Compliance | {score.compliance_score:.1f} | 20% |",
        f"| Cap table | {score.cap_table_score:.1f} | 15% |",
        f"| Pipeline | {score.pipeline_score:.1f} | 10% |",
        f"| Meeting follow-up | {score.meeting_score:.1f} | 5% |",
        "",
        "## Before vs. after cleanup",
        "",
        f"Current strict score: **{recovery['current_strict_score']:.1f}**. "
        f"Completing the evidence-backed recovery actions removes an estimated **{recovery['estimated_strict_score_lift']:.1f} weighted penalty points**, "
        f"for a point estimate of **{recovery['projected_strict_score']:.1f}** and a review range of **{recovery['projected_range_low']:.0f}–{recovery['projected_range_high']:.0f}**.",
        "",
        "| Recovery action | Estimated strict lift | Evidence basis |",
        "| --- | ---: | --- |",
    ]
    for item in recovery["actions"]:
        lines.append(
            f"| {item['action']} | +{item['estimated_score_lift']:.1f} | {item['source_evidence']} |"
        )
    lines += [
        "",
        f"_Methodology: {recovery['methodology']}_",
        "",
        "## Financial snapshot",
        "",
        f"- Latest monthly revenue: {_money(summary['latest_revenue'])}",
        f"- Revenue growth across the demo period: {summary['revenue_growth_percent']:.1f}%",
        f"- Burn increase across the demo period: {summary['burn_increase_percent']:.1f}%",
        f"- Gross-margin change: {summary['gross_margin_change'] * 100:.0f} percentage points",
        "",
        "## Data-room gaps",
        "",
    ]
    missing = [item for item in checklist if item["status"] != "present"]
    lines.extend(
        f"- **{item['name']}** — {item['status'].replace('_', ' ')} ({item['category']})"
        for item in missing
    )
    lines += ["", "## Risk flags", ""]
    for index, risk in enumerate(risks, 1):
        lines += [
            f"### {index}. {risk.title}",
            "",
            f"- **Severity / category:** {risk.severity} / {risk.category}",
            f"- **Evidence:** {risk.evidence}",
            f"- **Potential business impact:** {risk.business_impact}",
            f"- **Why this matters to investors:** {risk.why_matters_to_investors}",
            f"- **Suggested fix:** {risk.suggested_fix}",
            "",
        ]
    lines += ["## Investor diligence Q&A", ""]
    for index, question in enumerate(questions, 1):
        lines += [
            f"### Q{index}. {question.question}",
            "",
            question.suggested_answer,
            "",
            f"- **Sources:** {question.source}",
            f"- **Missing evidence:** {question.missing_evidence}",
            f"- **Evidence confidence:** {question.confidence:.0%}",
            "",
        ]
    lines += [
        "## Seven-day action plan",
        "",
        "| Action | Priority | Owner | Due | Estimated strict lift |",
        "| --- | --- | --- | --- | ---: |",
    ]
    for action in actions:
        lift = f"+{action.estimated_score_lift:.1f}" if action.estimated_score_lift else "Preparedness only"
        lines.append(f"| {action.title} | {action.priority} | {action.owner} | {action.due_date} | {lift} |")
    lines += [
        "",
        "## Source inventory",
        "",
    ]
    lines.extend(f"- `{document.file_name}` ({document.document_type})" for document in documents)
    lines += [
        "",
        "---",
        "",
        "All company data in this report is synthetic. Calculations and recommendations are deterministic and run locally.",
    ]
    return "\n".join(lines)
