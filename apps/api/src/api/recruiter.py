from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.services.recruiter_service import recruiter_service
from src.core.supabase import supabase
from src.schemas.recruiter import (
    RecruiterProfileUpdate, 
    CompanyProfileUpdate, 
    RecruiterStats,
    JobCreate,
    JobUpdate,
    JobResponse,
    JobAIPrompt,
    ApplicationStatusUpdate
)
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter(prefix="/recruiter", tags=["recruiter"])

class RegistrationUpdate(BaseModel):
    registration_number: str

class BioRequest(BaseModel):
    website: str

class CompanyDetailsUpdate(BaseModel):
    company_id: str
    name: str
    website: str
    location: str
    description: str

class RecruiterAnswerSubmission(BaseModel):
    question_text: str
    answer: str
    category: str

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    # Check if blocked
    blocked = supabase.table("blocked_users").select("*").eq("user_id", user_id).execute()
    if blocked.data:
        raise HTTPException(status_code=403, detail="Account blocked")
        
    return await recruiter_service.get_or_create_profile(user_id)

@router.get("/company-status")
async def get_company_status(user: dict = Depends(get_current_user)):
    """Check if the recruiter's company has already completed an assessment."""
    user_id = user["sub"]
    profile = await recruiter_service.get_or_create_profile(user_id)
    company_id = profile.get("company_id")
    
    if not company_id:
        return {"has_score": False, "score": 0}
        
    res = supabase.table("companies").select("profile_score").eq("id", company_id).execute()
    if res.data and res.data[0].get("profile_score", 0) > 0:
        return {
            "has_score": True, 
            "score": res.data[0]["profile_score"],
            "company_name": profile.get("companies", {}).get("name")
        }
    
    return {"has_score": False, "score": 0}

@router.post("/generate-bio")
async def generate_bio(data: BioRequest, user: dict = Depends(get_current_user)):
    """Scrapes the company website and generates a bio."""
    bio = await recruiter_service.generate_company_bio(data.website)
    if not bio:
        raise HTTPException(status_code=500, detail="Failed to generate bio from website")
    return {"bio": bio}

@router.patch("/profile")
async def update_profile(data: RecruiterProfileUpdate, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    update_data = data.model_dump(exclude_unset=True)
    
    try:
        # Update profile
        supabase.table("recruiter_profiles").update(update_data).eq("user_id", user_id).execute()
        
        # Recalculate completion score
        new_score = await recruiter_service.sync_completion_score(user_id)
        
        return {"status": "ok", "completion_score": new_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/company")
async def update_company(data: CompanyProfileUpdate, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    
    try:
        prof = await recruiter_service.get_or_create_profile(user_id)
        company_id = prof.get("company_id")
        if not company_id:
            raise HTTPException(status_code=400, detail="No company linked to profile")
            
        update_data = data.model_dump(exclude_unset=True)
        supabase.table("companies").update(update_data).eq("id", company_id).execute()
        
        # Recalculate completion score
        new_score = await recruiter_service.sync_completion_score(user_id)

        return {"status": "ok", "completion_score": new_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=RecruiterStats)
async def get_stats(user: dict = Depends(get_current_user)):
    try:
        return await recruiter_service.get_recruiter_stats(user["sub"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidate-pool")
async def get_candidate_pool(user: dict = Depends(get_current_user)):
    """Fetch all active candidates for the corporate candidate pool."""
    try:
        return await recruiter_service.get_candidate_pool()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candidate/{candidate_id}")
async def get_candidate_details(candidate_id: str, user: dict = Depends(get_current_user)):
    """Fetch profile and scores for a specific candidate."""
    try:
        # Check if user is a recruiter (auth check already done by get_current_user)
        # You can add additional checks here if needed
        return await recruiter_service.get_candidate_details(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/registration")
async def update_registration(data: RegistrationUpdate, user: dict = Depends(get_current_user)):
    return await recruiter_service.update_company_registration(user["sub"], data.registration_number)

# --- JOB MANAGEMENT ---

@router.get("/jobs", response_model=List[JobResponse])
async def list_jobs(user: dict = Depends(get_current_user)):
    return await recruiter_service.list_jobs(user["sub"])

@router.post("/jobs", response_model=JobResponse)
async def create_job(data: JobCreate, user: dict = Depends(get_current_user)):
    try:
        return await recruiter_service.create_job(user["sub"], data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@router.post("/applications/status")
async def update_application_status(data: ApplicationStatusUpdate, user: dict = Depends(get_current_user)):
    """Update status for a job application."""
    try:
        return await recruiter_service.update_application_status(
            user["sub"], 
            data.application_id, 
            data.status, 
            data.feedback
        )
    except Exception as e:
        raise HTTPException(status_code=403 if "Unauthorized" in str(e) else 500, detail=str(e))
@router.patch("/jobs/{job_id}", response_model=JobResponse)
async def update_job(job_id: str, data: JobUpdate, user: dict = Depends(get_current_user)):
    try:
        return await recruiter_service.update_job(user["sub"], job_id, data.model_dump(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/jobs/generate-ai")
async def generate_job_ai(data: JobAIPrompt, user: dict = Depends(get_current_user)):
    """Generate job details using AI."""
    return await recruiter_service.generate_job_description(data.prompt, data.experience_band)

@router.post("/details")
async def update_details(data: CompanyDetailsUpdate, user: dict = Depends(get_current_user)):
    details = data.dict()
    company_id = details.pop("company_id")
    return await recruiter_service.update_company_details(user["sub"], company_id, details)

@router.get("/assessment-questions")
async def get_assessment_questions(user: dict = Depends(get_current_user)):
    """Fetch 5 dynamic assessment questions for the recruiter."""
    questions = await recruiter_service.get_assessment_questions(user["sub"])
    if not questions:
        # Fallback to empty list or handle status code
        return []
    return questions

@router.post("/submit-answer")
async def submit_answer(submission: RecruiterAnswerSubmission, user: dict = Depends(get_current_user)):
    result = await recruiter_service.evaluate_recruiter_answer(
        user["sub"], 
        submission.question_text, 
        submission.answer, 
        submission.category
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message"))
    return result

@router.post("/complete-assessment")
async def complete_assessment(user: dict = Depends(get_current_user)):
    result = await recruiter_service.complete_recruiter_assessment(user["sub"])
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.post("/skip-assessment")
async def skip_assessment(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    profile = await recruiter_service.get_or_create_profile(user_id)
    company_id = profile.get("company_id")
    
    # Check if company already has a score
    has_score = False
    if company_id:
        res = supabase.table("companies").select("profile_score").eq("id", company_id).execute()
        if res.data and res.data[0].get("profile_score", 0) > 0:
            has_score = True

    # If company has score, they are fully COMPLETED
    # If not, they are marked as COMPLETED but assessment_status is not_started 
    # (The dashboard should check assessment_status for feature locking)
    supabase.table("recruiter_profiles").update({
        "onboarding_step": "COMPLETED",
        "assessment_status": "completed" if has_score else "not_started"
    }).eq("user_id", user_id).execute()
    
    return {"status": "skipped", "inherited": has_score}

@router.post("/tab-switch")
async def handle_tab_switch(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    
    # 1. Increment switch count (Safe execute)
    profile_res = supabase.table("recruiter_profiles").select("warning_count").eq("user_id", user_id).execute()
    
    current_count = profile_res.data[0].get("warning_count", 0) if profile_res.data else 0
    new_count = current_count + 1
    
    # Update count
    supabase.table("recruiter_profiles").update({"warning_count": new_count}).eq("user_id", user_id).execute()
    
    if new_count >= 2:
        # BAN USER
        supabase.table("blocked_users").insert({
            "user_id": user_id,
            "reason": "Security violation: Multiple tab switches during recruiter assessment."
        }).execute()
        
        # Update assessment status
        supabase.table("recruiter_profiles").update({"assessment_status": "disqualified"}).eq("user_id", user_id).execute()
        
        return {"status": "blocked", "message": "Security violation detected. You have been permanently blocked."}
    
    return {"status": "warning", "message": "Final warning: Tab switching is strictly prohibited."}
