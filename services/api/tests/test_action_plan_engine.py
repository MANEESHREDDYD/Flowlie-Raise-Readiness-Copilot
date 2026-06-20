from sqlalchemy import select

from app import models
from app.engines.action_plan_engine import generate_action_plan
from app.engines.risk_engine import generate_risks
from app.routes.helpers import company_data


def test_action_plan_has_owners_dates_and_priorities(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    risks = generate_risks(company, **company_data(db, company.id))
    tasks = generate_action_plan(risks)
    assert len(tasks) >= 8
    assert any(task["priority"] == "High" for task in tasks)
    assert all(task["owner"] and task["due_date"] and task["category"] and task["status"] for task in tasks)
    assert sum(task["estimated_score_lift"] for task in tasks) == 25.6
    assert any(task["estimated_score_lift"] == 0 for task in tasks)
