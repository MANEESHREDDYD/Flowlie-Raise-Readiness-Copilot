from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


Stage = Literal["Pre-Seed", "Seed", "Series A", "Series B", "Growth"]
RecordStatus = Literal["present", "missing", "needs_review", "outdated"]
ReviewStatus = Literal["draft", "needs_review", "reviewed"]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CompanyBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    industry: str = Field(min_length=1, max_length=120)
    stage: Stage
    target_raise: int = Field(ge=0)
    cash_balance: int = Field(ge=0)
    monthly_burn: int = Field(ge=0)
    current_arr: int = Field(ge=0)
    team_size: int = Field(ge=0)
    employees: int = Field(ge=0)
    contractors: int = Field(ge=0)
    primary_market: str = Field(min_length=1, max_length=120)
    fundraise_goal: str = Field(min_length=1)


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    industry: str | None = Field(default=None, min_length=1, max_length=120)
    stage: Stage | None = None
    target_raise: int | None = Field(default=None, ge=0)
    cash_balance: int | None = Field(default=None, ge=0)
    monthly_burn: int | None = Field(default=None, ge=0)
    current_arr: int | None = Field(default=None, ge=0)
    team_size: int | None = Field(default=None, ge=0)
    employees: int | None = Field(default=None, ge=0)
    contractors: int | None = Field(default=None, ge=0)
    primary_market: str | None = Field(default=None, min_length=1, max_length=120)
    fundraise_goal: str | None = Field(default=None, min_length=1)


class CompanyOut(CompanyBase, ORMModel):
    id: int
    created_at: datetime


class FinancialMetricCreate(BaseModel):
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    revenue: float = Field(ge=0)
    expenses: float = Field(ge=0)
    cash_balance: float = Field(ge=0)
    burn: float = Field(ge=0)
    gross_margin: float = Field(ge=0, le=1)


class FinancialMetricUpdate(BaseModel):
    month: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}$")
    revenue: float | None = Field(default=None, ge=0)
    expenses: float | None = Field(default=None, ge=0)
    cash_balance: float | None = Field(default=None, ge=0)
    burn: float | None = Field(default=None, ge=0)
    gross_margin: float | None = Field(default=None, ge=0, le=1)


class CapTableCreate(BaseModel):
    holder: str = Field(min_length=1)
    type: str = Field(min_length=1)
    is_founder: bool = False
    ownership_percent: float | None = Field(default=None, ge=0, le=100)
    shares: int | None = Field(default=None, ge=0)
    notes: str | None = None


class CapTableUpdate(BaseModel):
    holder: str | None = Field(default=None, min_length=1)
    type: str | None = Field(default=None, min_length=1)
    is_founder: bool | None = None
    ownership_percent: float | None = Field(default=None, ge=0, le=100)
    shares: int | None = Field(default=None, ge=0)
    notes: str | None = None


class HeadcountCreate(BaseModel):
    name: str = Field(min_length=1)
    role: str = Field(min_length=1)
    type: Literal["employee", "contractor"]
    start_date: str = Field(min_length=1)
    ip_assignment_signed: bool
    monthly_cost: float = Field(ge=0)


class HeadcountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    role: str | None = Field(default=None, min_length=1)
    type: Literal["employee", "contractor"] | None = None
    start_date: str | None = Field(default=None, min_length=1)
    ip_assignment_signed: bool | None = None
    monthly_cost: float | None = Field(default=None, ge=0)


class PipelineCreate(BaseModel):
    customer: str = Field(min_length=1)
    stage: str = Field(min_length=1)
    contract_value: float = Field(ge=0)
    probability: float = Field(ge=0, le=1)
    expected_close_month: str = ""
    revenue_concentration: float = Field(ge=0, le=1)


class PipelineUpdate(BaseModel):
    customer: str | None = Field(default=None, min_length=1)
    stage: str | None = Field(default=None, min_length=1)
    contract_value: float | None = Field(default=None, ge=0)
    probability: float | None = Field(default=None, ge=0, le=1)
    expected_close_month: str | None = None
    revenue_concentration: float | None = Field(default=None, ge=0, le=1)


class ComplianceCreate(BaseModel):
    item: str = Field(min_length=1)
    status: RecordStatus
    last_updated: str | None = None
    owner: str = Field(min_length=1)


class ComplianceUpdate(BaseModel):
    item: str | None = Field(default=None, min_length=1)
    status: RecordStatus | None = None
    last_updated: str | None = None
    owner: str | None = Field(default=None, min_length=1)


class DocumentTextCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    text: str = Field(min_length=1)
    status: RecordStatus = "present"


class DocumentUpdate(BaseModel):
    file_name: str | None = Field(default=None, min_length=1)
    document_type: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    status: RecordStatus | None = None
    extracted_text: str | None = None


class RiskUpdate(BaseModel):
    status: Literal["open", "completed", "dismissed"] | None = None
    operator_note: str | None = None
    founder_facing_note: str | None = None
    evidence_quality: str | None = None


class ReviewStatusUpdate(BaseModel):
    review_status: ReviewStatus


class DocumentOut(ORMModel):
    id: int
    company_id: int
    file_name: str
    document_type: str
    category: str
    status: str
    review_status: str
    evidence_quality: str
    extracted_text: str
    uploaded_at: datetime


class ConfidenceComponent(BaseModel):
    component: str
    score: float
    confidence: Literal["strong", "partial", "weak", "unknown"]
    evidence_coverage: float
    structured_records_count: int
    unknown_evidence_count: int
    needs_review_count: int
    reason: str
    limitations: list[str]


class ConfidenceAuditOut(BaseModel):
    company_id: int
    overall_confidence: Literal["strong", "partial", "weak", "unknown"]
    components: list[ConfidenceComponent]
    unknown_evidence_count: int
    needs_review_count: int
