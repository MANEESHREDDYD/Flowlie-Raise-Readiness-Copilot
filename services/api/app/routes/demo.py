from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..seed import demo_summary, reset_demo, seed_all_demo, seed_demo

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
@router.post("/seed-atlasai")
def seed_atlasai(db: Session = Depends(get_db)):
    company = seed_demo(db)
    return {"status": "ready", "company_id": company.id, "company_name": company.name}


@router.post("/seed-all")
def seed_all(db: Session = Depends(get_db)):
    companies = seed_all_demo(db)
    return {"seeded_companies": demo_summary(db, companies)}


@router.post("/reset")
def reset(db: Session = Depends(get_db)):
    reset_demo(db)
    return {"status": "reset"}


@router.get("/status")
def status(db: Session = Depends(get_db)):
    companies = list(db.scalars(select(models.Company).where(models.Company.is_demo.is_(True))).all())
    atlas = next((company for company in companies if company.name == "AtlasAI"), None)
    return {
        "seeded": bool(companies),
        "seeded_count": len(companies),
        "company_id": atlas.id if atlas else None,
        "company_names": [company.name for company in companies],
        "readiness_generated": bool(atlas and db.scalar(select(func.count()).select_from(models.ReadinessScore).where(models.ReadinessScore.company_id == atlas.id))),
        "risks_generated": bool(atlas and db.scalar(select(func.count()).select_from(models.RiskFlag).where(models.RiskFlag.company_id == atlas.id))),
        "questions_generated": bool(atlas and db.scalar(select(func.count()).select_from(models.InvestorQuestion).where(models.InvestorQuestion.company_id == atlas.id))),
        "action_plan_generated": bool(atlas and db.scalar(select(func.count()).select_from(models.ActionItem).where(models.ActionItem.company_id == atlas.id))),
    }
