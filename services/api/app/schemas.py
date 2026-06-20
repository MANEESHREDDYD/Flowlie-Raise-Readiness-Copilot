from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CompanyCreate(BaseModel):
    name: str
    industry: str
    stage: str
    target_raise: int
    cash_balance: int
    monthly_burn: int
    current_arr: int
    team_size: int
    employees: int
    contractors: int
    primary_market: str
    fundraise_goal: str


class CompanyOut(CompanyCreate, ORMModel):
    id: int
    created_at: datetime


class RiskUpdate(BaseModel):
    status: str


class DocumentOut(ORMModel):
    id: int
    company_id: int
    file_name: str
    document_type: str
    category: str
    status: str
    uploaded_at: datetime
