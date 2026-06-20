from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..engines.qa_engine import generate_questions
from ..engines.search_engine import search_documents
from .helpers import company_data, company_or_404

router = APIRouter(tags=["investor-qa"])


@router.post("/companies/{company_id}/investor-qa/generate")
def generate(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    db.execute(delete(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id))
    rows = [
        models.InvestorQuestion(company_id=company_id, **item)
        for item in generate_questions(company, data["metrics"], data["cap_table"], data["headcount"], data["pipeline"], data["compliance"], data["documents"])
    ]
    db.add_all(rows)
    db.commit()
    return rows


@router.get("/companies/{company_id}/investor-qa")
def list_questions(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    return list(db.scalars(select(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id)).all())


@router.get("/companies/{company_id}/evidence/search")
def evidence_search(company_id: int, q: str, db: Session = Depends(get_db)):
    data = company_data(db, company_id)
    return search_documents(data["documents"], q)
