from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..engines.readiness_engine import calculate_readiness
from .helpers import company_data, company_or_404

router = APIRouter(tags=["readiness"])


@router.post("/companies/{company_id}/readiness/run")
def run_readiness(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    questions_count = len(list(db.scalars(select(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id)).all()))
    result = calculate_readiness(company, **data, generated_questions_count=questions_count)
    tier = result.pop("readiness_tier")
    missing_inputs = result.pop("missing_inputs")
    score = models.ReadinessScore(company_id=company_id, **result)
    db.add(score)
    db.commit()
    db.refresh(score)
    return {**score.__dict__, "readiness_tier": tier, "missing_inputs": missing_inputs}


@router.get("/companies/{company_id}/readiness/latest")
def latest_readiness(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    score = db.scalar(select(models.ReadinessScore).where(models.ReadinessScore.company_id == company_id).order_by(models.ReadinessScore.generated_at.desc()))
    if not score:
        raise HTTPException(status_code=404, detail="Readiness analysis has not been run")
    from ..engines.readiness_engine import readiness_tier
    return {**score.__dict__, "readiness_tier": readiness_tier(score.overall_score)}
