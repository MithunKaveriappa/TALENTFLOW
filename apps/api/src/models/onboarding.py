from typing import Optional
from pydantic import BaseModel

class OnboardingState(BaseModel):
    experience_selected: bool
    resume_uploaded: bool
    skills_completed: bool
    assessment_completed: bool
    aadhaar_uploaded: bool
    terms_accepted: bool
