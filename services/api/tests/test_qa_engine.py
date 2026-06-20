from sqlalchemy import select

from app import models
from app.engines.qa_engine import generate_questions
from app.routes.helpers import company_data


def test_atlasai_questions_are_source_backed(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    data = company_data(db, company.id)
    questions = generate_questions(
        company, data["metrics"], data["cap_table"], data["headcount"],
        data["pipeline"], data["compliance"],
    )
    assert len(questions) >= 10
    assert all(question["suggested_answer"] for question in questions)
    assert all(question["source"] for question in questions)
    assert all("missing_evidence" in question for question in questions)
