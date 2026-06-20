from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Company(Base):
    __tablename__ = "companies"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    industry: Mapped[str] = mapped_column(String(120))
    stage: Mapped[str] = mapped_column(String(40))
    target_raise: Mapped[int]
    cash_balance: Mapped[int]
    monthly_burn: Mapped[int]
    current_arr: Mapped[int]
    team_size: Mapped[int]
    employees: Mapped[int]
    contractors: Mapped[int]
    primary_market: Mapped[str] = mapped_column(String(120))
    fundraise_goal: Mapped[str] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    portfolio_top_risk: Mapped[str | None] = mapped_column(String(160), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    documents: Mapped[list["Document"]] = relationship(cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    document_type: Mapped[str] = mapped_column(String(80))
    category: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(40), default="present")
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    evidence_quality: Mapped[str] = mapped_column(String(20), default="strong")
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FinancialMetric(Base):
    __tablename__ = "financial_metrics"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    month: Mapped[str] = mapped_column(String(20))
    revenue: Mapped[float]
    expenses: Mapped[float]
    cash_balance: Mapped[float]
    burn: Mapped[float]
    gross_margin: Mapped[float]


class CapTableEntry(Base):
    __tablename__ = "cap_table_entries"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    holder: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(40))
    is_founder: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    ownership_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    shares: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class HeadcountRecord(Base):
    __tablename__ = "headcount_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(40))
    start_date: Mapped[str] = mapped_column(String(20))
    ip_assignment_signed: Mapped[bool] = mapped_column(Boolean)
    monthly_cost: Mapped[float]


class CustomerPipelineRecord(Base):
    __tablename__ = "customer_pipeline_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    customer: Mapped[str] = mapped_column(String(120))
    stage: Mapped[str] = mapped_column(String(40))
    contract_value: Mapped[float]
    probability: Mapped[float]
    expected_close_month: Mapped[str] = mapped_column(String(20))
    revenue_concentration: Mapped[float]


class ComplianceItem(Base):
    __tablename__ = "compliance_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    item: Mapped[str] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(40))
    last_updated: Mapped[str | None] = mapped_column(String(20), nullable=True)
    owner: Mapped[str] = mapped_column(String(80))


class ReadinessScore(Base):
    __tablename__ = "readiness_scores"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    finance_score: Mapped[float]
    data_room_score: Mapped[float]
    compliance_score: Mapped[float]
    cap_table_score: Mapped[float]
    pipeline_score: Mapped[float]
    meeting_score: Mapped[float]
    overall_score: Mapped[float]
    summary: Mapped[str] = mapped_column(Text)
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskFlag(Base):
    __tablename__ = "risk_flags"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    category: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(200))
    evidence: Mapped[str] = mapped_column(Text)
    business_impact: Mapped[str] = mapped_column(Text)
    why_matters_to_investors: Mapped[str] = mapped_column(Text, default="")
    suggested_fix: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="open")
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    evidence_quality: Mapped[str] = mapped_column(String(20), default="strong")
    operator_note: Mapped[str] = mapped_column(Text, default="")
    founder_facing_note: Mapped[str] = mapped_column(Text, default="")
    reviewed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class InvestorQuestion(Base):
    __tablename__ = "investor_questions"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    question: Mapped[str] = mapped_column(Text)
    suggested_answer: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(500))
    missing_evidence: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float]
    category: Mapped[str] = mapped_column(String(80))
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")


class ActionItem(Base):
    __tablename__ = "action_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    title: Mapped[str] = mapped_column(String(240))
    priority: Mapped[str] = mapped_column(String(20))
    owner: Mapped[str] = mapped_column(String(80))
    due_date: Mapped[str] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(20), default="open")
    estimated_score_lift: Mapped[float] = mapped_column(Float, default=0)
    review_status: Mapped[str] = mapped_column(String(20), default="needs_review")
    evidence_quality: Mapped[str] = mapped_column(String(20), default="strong")
    operator_note: Mapped[str] = mapped_column(Text, default="")
    founder_facing_note: Mapped[str] = mapped_column(Text, default="")
    reviewed_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
