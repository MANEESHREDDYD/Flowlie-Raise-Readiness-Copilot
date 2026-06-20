from sqlalchemy import select

from app import models
from app.engines.risk_engine import generate_risks
from app.routes.helpers import company_data


def test_required_atlasai_risks_are_generated(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    risks = generate_risks(company, **company_data(db, company.id))
    titles = {risk["title"] for risk in risks}
    expected = {
        "Runway below investor comfort threshold",
        "Gross margin has materially declined",
        "Monthly burn is increasing quickly",
        "Contractor IP assignments are missing",
        "409A valuation is missing",
        "BOI filing confirmation is missing",
        "SAFE is not reflected in ownership",
        "Single-customer concentration is high",
        "Top-two customer concentration is high",
        "Detailed use-of-funds is missing",
    }
    assert expected <= titles
    assert "Runway requires immediate intervention" not in titles
    assert all(risk["why_matters_to_investors"] for risk in risks)
