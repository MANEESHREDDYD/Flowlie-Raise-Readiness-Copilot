from sqlalchemy import select

from app import models
from app.engines.readiness_engine import calculate_readiness, readiness_tier
from app.engines.recovery_engine import build_recovery_path
from app.routes.helpers import company_data


def test_atlasai_readiness_score_is_deterministic(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    result = calculate_readiness(company, **company_data(db, company.id), generated_questions_count=10)
    # The supplied penalty schedule mathematically produces 53.4 for AtlasAI.
    assert 50 <= result["overall_score"] <= 85
    assert result["overall_score"] == 53.4
    assert result["readiness_tier"] == "Not diligence-ready"
    assert readiness_tier(90) == "Investor-ready"
    assert readiness_tier(75) == "Mostly ready"
    assert readiness_tier(60) == "Needs cleanup"
    assert readiness_tier(40) == "Not diligence-ready"
    assert readiness_tier(39.9) == "High-risk raise preparation"


def test_recovery_path_uses_weighted_penalty_removal():
    recovery = build_recovery_path(53.4)
    assert recovery["estimated_strict_score_lift"] == 25.6
    assert recovery["projected_strict_score"] == 79.0
    assert recovery["projected_range_low"] == 78
    assert recovery["projected_range_high"] == 84
    assert recovery["projected_tier"] == "Mostly ready"


def test_finance_score_reflects_short_runway_margin_and_burn(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    result = calculate_readiness(company, **company_data(db, company.id), generated_questions_count=10)
    assert result["finance_score"] == 50
    assert result["finance_score"] < 100


def test_compliance_score_reflects_missing_evidence(db):
    company = db.scalar(select(models.Company).where(models.Company.name == "AtlasAI"))
    result = calculate_readiness(company, **company_data(db, company.id), generated_questions_count=10)
    assert result["compliance_score"] == 25
    assert result["compliance_score"] < 100
