from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models


def company_or_404(db: Session, company_id: int):
    company = db.get(models.Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


def company_data(db: Session, company_id: int) -> dict:
    company_or_404(db, company_id)
    names = {
        "documents": models.Document,
        "metrics": models.FinancialMetric,
        "compliance": models.ComplianceItem,
        "cap_table": models.CapTableEntry,
        "headcount": models.HeadcountRecord,
        "pipeline": models.CustomerPipelineRecord,
    }
    return {
        name: list(db.scalars(select(model).where(model.company_id == company_id)).all())
        for name, model in names.items()
    }
