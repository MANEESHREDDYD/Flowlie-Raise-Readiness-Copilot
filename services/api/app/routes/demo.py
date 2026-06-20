from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..seed import reset_demo, seed_demo

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
def seed(db: Session = Depends(get_db)):
    company = seed_demo(db)
    return {"status": "ready", "company_id": company.id, "company_name": company.name}


@router.post("/reset")
def reset(db: Session = Depends(get_db)):
    reset_demo(db)
    return {"status": "reset"}


@router.get("/status")
def status(db: Session = Depends(get_db)):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    return {
        "seeded": company is not None,
        "company_id": company.id if company else None,
        "readiness_generated": bool(company and db.scalar(select(func.count()).select_from(models.ReadinessScore).where(models.ReadinessScore.company_id == company.id))),
        "risks_generated": bool(company and db.scalar(select(func.count()).select_from(models.RiskFlag).where(models.RiskFlag.company_id == company.id))),
        "questions_generated": bool(company and db.scalar(select(func.count()).select_from(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company.id))),
        "action_plan_generated": bool(company and db.scalar(select(func.count()).select_from(models.ActionItem).where(models.ActionItem.company_id == company.id))),
    }
