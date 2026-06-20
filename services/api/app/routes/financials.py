from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..engines.financial_engine import financial_summary
from .helpers import company_or_404

router = APIRouter(tags=["financials"])


@router.post("/companies/{company_id}/financials")
def create_financial(company_id: int, payload: schemas.FinancialMetricCreate, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    row = models.FinancialMetric(company_id=company_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/companies/{company_id}/financials/bulk")
def create_financials_bulk(company_id: int, payload: list[schemas.FinancialMetricCreate], db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    rows = [models.FinancialMetric(company_id=company_id, **item.model_dump()) for item in payload]
    db.add_all(rows)
    db.commit()
    return rows


@router.patch("/financials/{financial_metric_id}")
def update_financial(financial_metric_id: int, payload: schemas.FinancialMetricUpdate, db: Session = Depends(get_db)):
    row = db.get(models.FinancialMetric, financial_metric_id)
    if not row:
        raise HTTPException(status_code=404, detail="Financial metric not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/financials/{financial_metric_id}", status_code=204)
def delete_financial(financial_metric_id: int, db: Session = Depends(get_db)):
    row = db.get(models.FinancialMetric, financial_metric_id)
    if not row:
        raise HTTPException(status_code=404, detail="Financial metric not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.get("/companies/{company_id}/financials")
def financials(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.FinancialMetric).where(models.FinancialMetric.company_id == company_id).order_by(models.FinancialMetric.month)).all())


@router.get("/companies/{company_id}/financials/summary")
def summary(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    metrics = list(db.scalars(select(models.FinancialMetric).where(models.FinancialMetric.company_id == company_id)).all())
    return financial_summary(metrics)
