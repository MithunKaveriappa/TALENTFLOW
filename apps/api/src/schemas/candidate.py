from pydantic import BaseModel, HttpUrl, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CandidateProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile_photo_url: Optional[str] = None
    bio: Optional[str] = None
    current_role: Optional[str] = Field(None, alias="current_role")
    years_of_experience: Optional[int] = None
    primary_industry_focus: Optional[str] = None
    current_employment_status: Optional[str] = None
    current_company_name: Optional[str] = None
    previous_companies: Optional[List[str]] = None
    key_responsibilities: Optional[str] = None
    major_achievements: Optional[str] = None
    sales_metrics: Optional[Dict[str, Any]] = None
    crm_tools: Optional[List[str]] = None
    sales_methodologies: Optional[List[str]] = None
    product_domain_expertise: Optional[List[str]] = None
    target_market_exposure: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    learning_links: Optional[List[Dict[str, str]]] = None
    career_interests: Optional[List[str]] = None
    learning_interests: Optional[List[str]] = None
    job_type: Optional[str] = None

    class Config:
        populate_by_name = True

class CandidateStats(BaseModel):
    applications_count: int
    shortlisted_count: int
    invites_received: int
    posts_count: int
    saved_jobs_count: int
    profile_score: Optional[int]
    profile_strength: str
    completion_score: int
    assessment_status: str
    identity_verified: bool
    account_status: str
