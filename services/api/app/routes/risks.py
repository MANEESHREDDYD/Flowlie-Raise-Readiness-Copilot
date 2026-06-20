from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..engines.risk_engine import generate_risks
from .helpers import company_data, company_or_404

router = APIRouter(tags=["risks"])


@router.post("/companies/{company_id}/risks/generate")
def generate(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    db.execute(delete(models.RiskFlag).where(models.RiskFlag.company_id == company_id))
    rows = [models.RiskFlag(company_id=company_id, **risk) for risk in generate_risks(company, **data)]
    db.add_all(rows)
    db.commit()
    return rows


@router.get("/companies/{company_id}/risks")
def list_risks(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.RiskFlag).where(models.RiskFlag.company_id == company_id)).all())


@router.patch("/risks/{risk_id}")
def update_risk(risk_id: int, payload: schemas.RiskUpdate, db: Session = Depends(get_db)):
    risk = db.get(models.RiskFlag, risk_id)
    if not risk:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Risk not found")
    if payload.status is not None:
        risk.status = payload.status
    if payload.operator_note is not None:
        risk.operator_note = payload.operator_note
    if payload.founder_facing_note is not None:
        risk.founder_facing_note = payload.founder_facing_note
    if payload.evidence_quality is not None:
        risk.evidence_quality = payload.evidence_quality
    db.commit()
    db.refresh(risk)
    return risk
