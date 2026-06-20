from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..engines.data_room_engine import build_data_room
from ..engines.document_classifier import classify_document
from ..engines.ingestion_engine import ingest_upload
from .helpers import company_data, company_or_404

router = APIRouter(tags=["documents"])


@router.post("/companies/{company_id}/documents/upload", response_model=schemas.DocumentOut)
async def upload_document(company_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    result = await ingest_upload(file, Path(__file__).resolve().parents[2] / "uploads" / str(company_id))
    document = models.Document(
        company_id=company_id, file_name=result["file_name"], document_type=result["document_type"],
        category=result["category"], status="present", extracted_text=result["text"],
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/companies/{company_id}/documents", response_model=list[schemas.DocumentOut])
def documents(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.Document).where(models.Document.company_id == company_id)).all())


@router.post("/companies/{company_id}/documents/analyze")
def analyze_documents(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    docs = list(db.scalars(select(models.Document).where(models.Document.company_id == company_id)).all())
    results = []
    for doc in docs:
        result = classify_document(doc.extracted_text, doc.file_name)
        if doc.document_type == "unknown":
            doc.document_type, doc.category = result["document_type"], result["category"]
        results.append({"document_id": doc.id, "file_name": doc.file_name, **result})
    db.commit()
    return results


@router.get("/companies/{company_id}/data-room")
def data_room(company_id: int, db: Session = Depends(get_db)):
    data = company_data(db, company_id)
    return build_data_room(data["documents"], data["compliance"])
