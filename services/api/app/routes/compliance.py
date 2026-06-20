from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from .helpers import company_or_404

router = APIRouter(tags=["compliance"])


@router.get("/companies/{company_id}/compliance")
def compliance(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.ComplianceItem).where(models.ComplianceItem.company_id == company_id)).all())


@router.get("/companies/{company_id}/cap-table")
def cap_table(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.CapTableEntry).where(models.CapTableEntry.company_id == company_id)).all())
