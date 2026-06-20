from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from .helpers import company_or_404

router = APIRouter(tags=["company-data"])


def _create(db, model, company_id, payload):
    company_or_404(db, company_id)
    row = model(company_id=company_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _bulk(db, model, company_id, payload):
    company_or_404(db, company_id)
    rows = [model(company_id=company_id, **item.model_dump()) for item in payload]
    db.add_all(rows)
    db.commit()
    return rows


def _update(db, model, row_id, payload, label):
    row = db.get(model, row_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row


def _delete(db, model, row_id, label):
    row = db.get(model, row_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.get("/companies/{company_id}/cap-table")
def cap_table(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.CapTableEntry).where(models.CapTableEntry.company_id == company_id)).all())


@router.post("/companies/{company_id}/cap-table")
def create_cap(company_id: int, payload: schemas.CapTableCreate, db: Session = Depends(get_db)):
    return _create(db, models.CapTableEntry, company_id, payload)


@router.post("/companies/{company_id}/cap-table/bulk")
def bulk_cap(company_id: int, payload: list[schemas.CapTableCreate], db: Session = Depends(get_db)):
    return _bulk(db, models.CapTableEntry, company_id, payload)


@router.patch("/cap-table/{entry_id}")
def update_cap(entry_id: int, payload: schemas.CapTableUpdate, db: Session = Depends(get_db)):
    return _update(db, models.CapTableEntry, entry_id, payload, "Cap table entry")


@router.delete("/cap-table/{entry_id}", status_code=204)
def delete_cap(entry_id: int, db: Session = Depends(get_db)):
    return _delete(db, models.CapTableEntry, entry_id, "Cap table entry")


@router.get("/companies/{company_id}/headcount")
def headcount(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.HeadcountRecord).where(models.HeadcountRecord.company_id == company_id)).all())


@router.post("/companies/{company_id}/headcount")
def create_headcount(company_id: int, payload: schemas.HeadcountCreate, db: Session = Depends(get_db)):
    return _create(db, models.HeadcountRecord, company_id, payload)


@router.post("/companies/{company_id}/headcount/bulk")
def bulk_headcount(company_id: int, payload: list[schemas.HeadcountCreate], db: Session = Depends(get_db)):
    return _bulk(db, models.HeadcountRecord, company_id, payload)


@router.patch("/headcount/{record_id}")
def update_headcount(record_id: int, payload: schemas.HeadcountUpdate, db: Session = Depends(get_db)):
    return _update(db, models.HeadcountRecord, record_id, payload, "Headcount record")


@router.delete("/headcount/{record_id}", status_code=204)
def delete_headcount(record_id: int, db: Session = Depends(get_db)):
    return _delete(db, models.HeadcountRecord, record_id, "Headcount record")


@router.get("/companies/{company_id}/customer-pipeline")
def pipeline(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.CustomerPipelineRecord).where(models.CustomerPipelineRecord.company_id == company_id)).all())


@router.post("/companies/{company_id}/customer-pipeline")
def create_pipeline(company_id: int, payload: schemas.PipelineCreate, db: Session = Depends(get_db)):
    return _create(db, models.CustomerPipelineRecord, company_id, payload)


@router.post("/companies/{company_id}/customer-pipeline/bulk")
def bulk_pipeline(company_id: int, payload: list[schemas.PipelineCreate], db: Session = Depends(get_db)):
    return _bulk(db, models.CustomerPipelineRecord, company_id, payload)


@router.patch("/customer-pipeline/{record_id}")
def update_pipeline(record_id: int, payload: schemas.PipelineUpdate, db: Session = Depends(get_db)):
    return _update(db, models.CustomerPipelineRecord, record_id, payload, "Pipeline record")


@router.delete("/customer-pipeline/{record_id}", status_code=204)
def delete_pipeline(record_id: int, db: Session = Depends(get_db)):
    return _delete(db, models.CustomerPipelineRecord, record_id, "Pipeline record")


@router.get("/companies/{company_id}/compliance")
def compliance(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.ComplianceItem).where(models.ComplianceItem.company_id == company_id)).all())


@router.post("/companies/{company_id}/compliance")
def create_compliance(company_id: int, payload: schemas.ComplianceCreate, db: Session = Depends(get_db)):
    return _create(db, models.ComplianceItem, company_id, payload)


@router.post("/companies/{company_id}/compliance/bulk")
def bulk_compliance(company_id: int, payload: list[schemas.ComplianceCreate], db: Session = Depends(get_db)):
    return _bulk(db, models.ComplianceItem, company_id, payload)


@router.patch("/compliance/{item_id}")
def update_compliance(item_id: int, payload: schemas.ComplianceUpdate, db: Session = Depends(get_db)):
    return _update(db, models.ComplianceItem, item_id, payload, "Compliance item")


@router.delete("/compliance/{item_id}", status_code=204)
def delete_compliance(item_id: int, db: Session = Depends(get_db)):
    return _delete(db, models.ComplianceItem, item_id, "Compliance item")
