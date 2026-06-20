from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..engines.financial_engine import financial_summary
from .helpers import company_or_404

router = APIRouter(tags=["financials"])


@router.get("/companies/{company_id}/financials")
def financials(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.FinancialMetric).where(models.FinancialMetric.company_id == company_id).order_by(models.FinancialMetric.month)).all())


@router.get("/companies/{company_id}/financials/summary")
def summary(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    metrics = list(db.scalars(select(models.FinancialMetric).where(models.FinancialMetric.company_id == company_id)).all())
    return financial_summary(metrics)
