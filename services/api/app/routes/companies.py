from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..engines.data_room_engine import build_data_room
from ..engines.financial_engine import financial_summary
from ..engines.readiness_engine import readiness_tier
from ..engines.recovery_engine import build_recovery_path
from ..engines.report_engine import build_diligence_report
from ..engines.confidence_engine import calculate_confidence
from .helpers import company_data, company_or_404

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("", response_model=schemas.CompanyOut)
def create_company(payload: schemas.CompanyCreate, db: Session = Depends(get_db)):
    company = models.Company(**payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.patch("/{company_id}", response_model=schemas.CompanyOut)
def update_company(company_id: int, payload: schemas.CompanyUpdate, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    for model in [
        models.ActionItem, models.InvestorQuestion, models.RiskFlag, models.ReadinessScore,
        models.ComplianceItem, models.CustomerPipelineRecord, models.HeadcountRecord,
        models.CapTableEntry, models.FinancialMetric, models.Document,
    ]:
        db.execute(delete(model).where(model.company_id == company_id))
    db.execute(delete(models.Company).where(models.Company.id == company_id))
    db.commit()
    return Response(status_code=204)


@router.get("", response_model=list[schemas.CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return list(db.scalars(select(models.Company).order_by(models.Company.created_at.desc())).all())


@router.get("/summary")
def company_summary(db: Session = Depends(get_db)):
    companies = list(db.scalars(select(models.Company).order_by(models.Company.id)).all())
    results = []
    for company in companies:
        score = db.scalar(
            select(models.ReadinessScore)
            .where(models.ReadinessScore.company_id == company.id)
            .order_by(models.ReadinessScore.generated_at.desc())
        )
        risks = list(db.scalars(select(models.RiskFlag).where(models.RiskFlag.company_id == company.id)).all())
        action_count = db.scalar(
            select(func.count()).select_from(models.ActionItem)
            .where(models.ActionItem.company_id == company.id, models.ActionItem.status == "open")
        )
        results.append({
            "id": company.id,
            "name": company.name,
            "stage": company.stage,
            "industry": company.industry,
            "score": score.overall_score if score else None,
            "tier": readiness_tier(score.overall_score) if score else "Not analyzed",
            "review_status": score.review_status if score else "draft",
            "top_risk": company.portfolio_top_risk or (risks[0].title if risks else "Analysis pending"),
            "risk_count": len(risks),
            "open_action_items": action_count or 0,
            "created_at": company.created_at,
            "is_demo": company.is_demo,
        })
    return results


@router.get("/{company_id}", response_model=schemas.CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    return company_or_404(db, company_id)


@router.get("/{company_id}/dashboard")
def dashboard(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    score = db.scalar(select(models.ReadinessScore).where(models.ReadinessScore.company_id == company_id).order_by(models.ReadinessScore.generated_at.desc()))
    severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    risks = list(db.scalars(select(models.RiskFlag).where(models.RiskFlag.company_id == company_id)).all())
    questions = list(db.scalars(select(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id)).all())
    risks.sort(key=lambda item: severity_order.get(item.severity, 4))
    room = build_data_room(data["documents"], data["compliance"])
    score_payload = None
    recovery = None
    if score:
        score_payload = {**score.__dict__, "readiness_tier": readiness_tier(score.overall_score)}
        actions = list(db.scalars(select(models.ActionItem).where(models.ActionItem.company_id == company_id)).all())
        recovery = build_recovery_path(score.overall_score, actions)
    return {
        "company": company,
        "latest_readiness_score": score_payload,
        "readiness_tier": readiness_tier(score.overall_score) if score else None,
        "recovery_path": recovery,
        "top_risks": risks[:5],
        "missing_documents": [item for item in room if item["status"] != "present"],
        "financial_summary": financial_summary(data["metrics"]),
        "investor_questions_count": len(questions),
        "open_action_items_count": db.scalar(select(func.count()).select_from(models.ActionItem).where(models.ActionItem.company_id == company_id, models.ActionItem.status == "open")),
        "confidence_audit": calculate_confidence(
            company=company, readiness_score=score, questions=questions, **data
        ),
    }


@router.get("/{company_id}/recovery-path")
def recovery_path(company_id: int, db: Session = Depends(get_db)):
    company_or_404(db, company_id)
    score = db.scalar(
        select(models.ReadinessScore)
        .where(models.ReadinessScore.company_id == company_id)
        .order_by(models.ReadinessScore.generated_at.desc())
    )
    if not score:
        raise HTTPException(status_code=404, detail="Readiness analysis has not been run")
    actions = list(db.scalars(select(models.ActionItem).where(models.ActionItem.company_id == company_id)).all())
    return build_recovery_path(score.overall_score, actions)


@router.get("/{company_id}/diligence-report.md")
def diligence_report(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    score = db.scalar(
        select(models.ReadinessScore)
        .where(models.ReadinessScore.company_id == company_id)
        .order_by(models.ReadinessScore.generated_at.desc())
    )
    if not score:
        raise HTTPException(status_code=404, detail="Run readiness analysis before exporting a report")
    risks = list(db.scalars(select(models.RiskFlag).where(models.RiskFlag.company_id == company_id)).all())
    questions = list(db.scalars(select(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id)).all())
    actions = list(db.scalars(select(models.ActionItem).where(models.ActionItem.company_id == company_id).order_by(models.ActionItem.due_date)).all())
    markdown = build_diligence_report(
        company=company,
        score=score,
        risks=risks,
        questions=questions,
        actions=actions,
        **data,
    )
    return Response(
        content=markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{company.name.lower()}-diligence-report.md"'},
    )


@router.get("/{company_id}/confidence-audit", response_model=schemas.ConfidenceAuditOut)
def confidence_audit(company_id: int, db: Session = Depends(get_db)):
    company = company_or_404(db, company_id)
    data = company_data(db, company_id)
    score = db.scalar(
        select(models.ReadinessScore)
        .where(models.ReadinessScore.company_id == company_id)
        .order_by(models.ReadinessScore.generated_at.desc())
    )
    questions = list(db.scalars(
        select(models.InvestorQuestion).where(models.InvestorQuestion.company_id == company_id)
    ).all())
    return calculate_confidence(
        company=company, readiness_score=score, questions=questions, **data
    )
