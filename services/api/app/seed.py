import csv
import json
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from . import models
from .engines.document_classifier import classify_document


DEMO_ROOT = Path(__file__).resolve().parents[3] / "demo-data"
DEMO_FILES = [
    "atlasai_pitch_deck_summary.txt",
    "atlasai_financials.csv",
    "atlasai_cap_table.csv",
    "atlasai_headcount.csv",
    "atlasai_customer_pipeline.csv",
    "atlasai_compliance_checklist.csv",
    "atlasai_investor_meeting_transcript.txt",
    "atlasai_investor_update.txt",
    "atlasai_data_room_index.txt",
]
TYPE_OVERRIDES = {
    "atlasai_pitch_deck_summary.txt": ("pitch_deck", "Fundraising"),
    "atlasai_financials.csv": ("financials", "Finance"),
    "atlasai_cap_table.csv": ("cap_table", "Ownership"),
    "atlasai_headcount.csv": ("headcount", "People"),
    "atlasai_customer_pipeline.csv": ("customer_pipeline", "Commercial"),
    "atlasai_compliance_checklist.csv": ("compliance", "Legal & compliance"),
    "atlasai_investor_meeting_transcript.txt": ("investor_meeting", "Fundraising"),
    "atlasai_investor_update.txt": ("investor_update", "Fundraising"),
    "atlasai_data_room_index.txt": ("data_room_index", "Operations"),
}


def _rows(file_name: str):
    with (DEMO_ROOT / file_name).open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def reset_demo(db: Session):
    for model in [
        models.ActionItem, models.InvestorQuestion, models.RiskFlag, models.ReadinessScore,
        models.ComplianceItem, models.CustomerPipelineRecord, models.HeadcountRecord,
        models.CapTableEntry, models.FinancialMetric, models.Document, models.Company,
    ]:
        db.execute(delete(model))
    db.commit()


def seed_demo(db: Session) -> models.Company:
    existing = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    if existing:
        return existing
    profile = json.loads((DEMO_ROOT / "atlasai_company_profile.json").read_text(encoding="utf-8"))
    company = models.Company(
        name=profile["company_name"],
        industry=profile["industry"],
        stage=profile["stage"],
        target_raise=profile["target_raise"],
        cash_balance=profile["cash_balance"],
        monthly_burn=profile["monthly_burn"],
        current_arr=profile["current_arr"],
        team_size=profile["team_size"],
        employees=profile["employees"],
        contractors=profile["contractors"],
        primary_market=profile["primary_market"],
        fundraise_goal=profile["fundraise_goal"],
    )
    db.add(company)
    db.flush()

    for file_name in DEMO_FILES:
        text = (DEMO_ROOT / file_name).read_text(encoding="utf-8")
        doc_type, category = TYPE_OVERRIDES.get(file_name, (
            classify_document(text, file_name)["document_type"],
            classify_document(text, file_name)["category"],
        ))
        db.add(models.Document(
            company_id=company.id, file_name=file_name, document_type=doc_type,
            category=category, status="present", extracted_text=text,
        ))
    for row in _rows("atlasai_financials.csv"):
        db.add(models.FinancialMetric(company_id=company.id, **{
            "month": row["month"], "revenue": float(row["revenue"]), "expenses": float(row["expenses"]),
            "cash_balance": float(row["cash_balance"]), "burn": float(row["burn"]),
            "gross_margin": float(row["gross_margin"]),
        }))
    for row in _rows("atlasai_cap_table.csv"):
        db.add(models.CapTableEntry(
            company_id=company.id, holder=row["holder"], type=row["type"],
            ownership_percent=float(row["ownership_percent"]) if row["ownership_percent"] else None,
            shares=int(row["shares"]) if row["shares"] else None, notes=row["notes"] or None,
        ))
    for row in _rows("atlasai_headcount.csv"):
        db.add(models.HeadcountRecord(
            company_id=company.id, name=row["name"], role=row["role"], type=row["type"],
            start_date=row["start_date"], ip_assignment_signed=row["ip_assignment_signed"].lower() == "true",
            monthly_cost=float(row["monthly_cost"]),
        ))
    for row in _rows("atlasai_customer_pipeline.csv"):
        db.add(models.CustomerPipelineRecord(
            company_id=company.id, customer=row["customer"], stage=row["stage"],
            contract_value=float(row["contract_value"]), probability=float(row["probability"]),
            expected_close_month=row["expected_close_month"],
            revenue_concentration=float(row["revenue_concentration"]),
        ))
    for row in _rows("atlasai_compliance_checklist.csv"):
        db.add(models.ComplianceItem(
            company_id=company.id, item=row["item"], status=row["status"],
            last_updated=row["last_updated"] or None, owner=row["owner"],
        ))
    db.commit()
    db.refresh(company)
    return company
