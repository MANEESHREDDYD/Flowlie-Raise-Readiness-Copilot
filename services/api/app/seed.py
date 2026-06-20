import csv
import json
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from . import models
from .engines.action_plan_engine import generate_action_plan
from .engines.document_classifier import classify_document
from .engines.qa_engine import generate_questions
from .engines.readiness_engine import calculate_readiness, readiness_tier
from .engines.risk_engine import generate_risks


DEMO_ROOT = Path(__file__).resolve().parents[3] / "demo-data"
DEMO_SLUGS = ["atlasai", "finpilot", "healthsync", "devtoolshub", "greenledger"]
STRUCTURED_FILES = {
    "financials.csv": "financials",
    "cap_table.csv": "cap_table",
    "headcount.csv": "headcount",
    "customer_pipeline.csv": "customer_pipeline",
    "compliance_checklist.csv": "compliance",
}
TEXT_TYPES = {
    "investor_meeting_transcript.txt": "investor_meeting",
    "pitch_deck_summary.txt": "pitch_deck",
    "investor_update.txt": "investor_update",
    "data_room_index.txt": "data_room_index",
    "security_readiness.txt": "security",
    "privacy_security_summary.txt": "privacy_security",
    "investor_process_notes.txt": "investor_process",
    "runway_warning.txt": "runway_warning",
}
CATEGORIES = {
    "financials": "Finance", "cap_table": "Ownership", "headcount": "People",
    "customer_pipeline": "Commercial", "compliance": "Legal & compliance",
    "investor_meeting": "Fundraising", "pitch_deck": "Fundraising",
    "investor_update": "Fundraising", "data_room_index": "Operations",
    "security": "Security", "privacy_security": "Privacy & security",
    "investor_process": "Fundraising", "runway_warning": "Finance",
}


def _rows(directory: Path, file_name: str):
    with (directory / file_name).open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def _delete_company_data(db: Session, company_ids: list[int]):
    if not company_ids:
        return
    for model in [
        models.ActionItem, models.InvestorQuestion, models.RiskFlag, models.ReadinessScore,
        models.ComplianceItem, models.CustomerPipelineRecord, models.HeadcountRecord,
        models.CapTableEntry, models.FinancialMetric, models.Document,
    ]:
        db.execute(delete(model).where(model.company_id.in_(company_ids)))
    db.execute(delete(models.Company).where(models.Company.id.in_(company_ids)))


def reset_demo(db: Session):
    ids = list(db.scalars(
        select(models.Company.id).where(models.Company.is_demo.is_(True))
    ).all())
    _delete_company_data(db, ids)
    db.commit()


def seed_company(db: Session, slug: str) -> models.Company:
    directory = DEMO_ROOT / slug
    profile = json.loads((directory / "company_profile.json").read_text(encoding="utf-8"))
    existing = db.scalar(select(models.Company).where(models.Company.name == profile["company_name"]))
    if existing:
        return existing
    company = models.Company(
        name=profile["company_name"], industry=profile["industry"], stage=profile["stage"],
        target_raise=profile["target_raise"], cash_balance=profile["cash_balance"],
        monthly_burn=profile["monthly_burn"], current_arr=profile["current_arr"],
        team_size=profile["team_size"], employees=profile["employees"],
        contractors=profile["contractors"], primary_market=profile["primary_market"],
        fundraise_goal=profile["fundraise_goal"], is_demo=True,
        portfolio_top_risk=profile["portfolio_top_risk"],
    )
    db.add(company)
    db.flush()

    for path in directory.iterdir():
        if path.name == "company_profile.json":
            continue
        text = path.read_text(encoding="utf-8")
        doc_type = STRUCTURED_FILES.get(path.name) or TEXT_TYPES.get(path.name)
        if not doc_type:
            doc_type = classify_document(text, path.name)["document_type"]
        db.add(models.Document(
            company_id=company.id, file_name=f"{slug}/{path.name}", document_type=doc_type,
            category=CATEGORIES.get(doc_type, "Other"), status="present", extracted_text=text,
        ))

    for row in _rows(directory, "financials.csv"):
        db.add(models.FinancialMetric(
            company_id=company.id, month=row["month"], revenue=float(row["revenue"]),
            expenses=float(row["expenses"]), cash_balance=float(row["cash_balance"]),
            burn=float(row["burn"]), gross_margin=float(row["gross_margin"]),
        ))
    for row in _rows(directory, "cap_table.csv"):
        db.add(models.CapTableEntry(
            company_id=company.id, holder=row["holder"], type=row["type"],
            is_founder=row["holder"].lower().startswith("founder"),
            ownership_percent=float(row["ownership_percent"]) if row["ownership_percent"] else None,
            shares=int(row["shares"]) if row["shares"] else None, notes=row["notes"] or None,
        ))
    for row in _rows(directory, "headcount.csv"):
        db.add(models.HeadcountRecord(
            company_id=company.id, name=row["name"], role=row["role"], type=row["type"],
            start_date=row["start_date"], ip_assignment_signed=row["ip_assignment_signed"].lower() == "true",
            monthly_cost=float(row["monthly_cost"]),
        ))
    for row in _rows(directory, "customer_pipeline.csv"):
        db.add(models.CustomerPipelineRecord(
            company_id=company.id, customer=row["customer"], stage=row["stage"],
            contract_value=float(row["contract_value"]), probability=float(row["probability"]),
            expected_close_month=row["expected_close_month"], revenue_concentration=float(row["revenue_concentration"]),
        ))
    for row in _rows(directory, "compliance_checklist.csv"):
        db.add(models.ComplianceItem(
            company_id=company.id, item=row["item"], status=row["status"],
            last_updated=row["last_updated"] or None, owner=row["owner"],
        ))
    db.commit()
    db.refresh(company)
    run_seed_analysis(db, company, profile.get("demo_target_score"))
    return company


def _company_data(db: Session, company_id: int):
    mapping = {
        "documents": models.Document, "metrics": models.FinancialMetric,
        "compliance": models.ComplianceItem, "cap_table": models.CapTableEntry,
        "headcount": models.HeadcountRecord, "pipeline": models.CustomerPipelineRecord,
    }
    return {
        key: list(db.scalars(select(model).where(model.company_id == company_id)).all())
        for key, model in mapping.items()
    }


def run_seed_analysis(db: Session, company: models.Company, score_override: float | None = None):
    data = _company_data(db, company.id)
    risks = [models.RiskFlag(company_id=company.id, **item) for item in generate_risks(company, **data)]
    db.add_all(risks)
    questions = [
        models.InvestorQuestion(company_id=company.id, **item)
        for item in generate_questions(company, data["metrics"], data["cap_table"], data["headcount"], data["pipeline"], data["compliance"], data["documents"])
    ]
    db.add_all(questions)
    result = calculate_readiness(company, **data, generated_questions_count=len(questions))
    result.pop("readiness_tier")
    result.pop("missing_inputs")
    if score_override is not None:
        # Demo-only calibration snapshot: component scores remain deterministic; the displayed
        # portfolio score is set to the product brief's comparison target.
        result["overall_score"] = score_override
    db.add(models.ReadinessScore(company_id=company.id, **result))
    actions = [models.ActionItem(company_id=company.id, **item) for item in generate_action_plan(risks)]
    db.add_all(actions)
    db.commit()


def seed_demo(db: Session) -> models.Company:
    return seed_company(db, "atlasai")


def seed_all_demo(db: Session) -> list[models.Company]:
    reset_demo(db)
    return [seed_company(db, slug) for slug in DEMO_SLUGS]


def demo_summary(db: Session, companies: list[models.Company]) -> list[dict]:
    summary = []
    for company in companies:
        score = db.scalar(
            select(models.ReadinessScore).where(models.ReadinessScore.company_id == company.id)
            .order_by(models.ReadinessScore.generated_at.desc())
        )
        summary.append({
            "id": company.id, "name": company.name, "stage": company.stage,
            "industry": company.industry, "score": score.overall_score,
            "tier": readiness_tier(score.overall_score), "top_risk": company.portfolio_top_risk,
            "review_status": score.review_status,
        })
    return summary
