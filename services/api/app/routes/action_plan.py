from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..engines.action_plan_engine import generate_action_plan
from .helpers import company_or_404

router = APIRouter(tags=["action-plan"])


@router.post("/companies/{company_id}/action-plan/generate")
def generate(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    risks = list(db.scalars(select(models.RiskFlag).where(models.RiskFlag.company_id == company_id)).all())
    db.execute(delete(models.ActionItem).where(models.ActionItem.company_id == company_id))
    rows = [models.ActionItem(company_id=company_id, **item) for item in generate_action_plan(risks)]
    db.add_all(rows)
    db.commit()
    return rows


@router.get("/companies/{company_id}/action-plan")
def list_actions(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.ActionItem).where(models.ActionItem.company_id == company_id).order_by(models.ActionItem.due_date)).all())
