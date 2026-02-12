from pydantic import BaseModel, HttpUrl, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RecruiterProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    job_title: Optional[str] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    industry_category: Optional[str] = None
    size_band: Optional[str] = None
    sales_model: Optional[str] = None
    target_market: Optional[str] = None
    hiring_focus_areas: Optional[List[str]] = None
    avg_deal_size_range: Optional[str] = None

class RecruiterStats(BaseModel):
    active_jobs_count: int
    total_hires_count: int
    invites_sent_count: int
    pending_applications_count: int
    response_rate: float
    avg_hiring_cycle: Optional[float]
    candidate_feedback_score: float
    company_quality_score: int
    visibility_tier: str
    assessment_status: str
    verification_status: str
    account_status: str
    completion_score: int
