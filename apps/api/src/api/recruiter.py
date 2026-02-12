from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.services.recruiter_service import recruiter_service
from src.core.supabase import supabase
from src.schemas.recruiter import RecruiterProfileUpdate, CompanyProfileUpdate, RecruiterStats
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/recruiter", tags=["recruiter"])

class RegistrationUpdate(BaseModel):
    registration_number: str

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

@router.post("/details")
async def update_details(data: CompanyDetailsUpdate, user: dict = Depends(get_current_user)):
    details = data.dict()
    company_id = details.pop("company_id")
    return await recruiter_service.update_company_details(user["sub"], company_id, details)

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
    # Just update the step to COMPLETED but leave assessment_status as not_started
    supabase.table("recruiter_profiles").update({
        "onboarding_step": "COMPLETED"
    }).eq("user_id", user["sub"]).execute()
    return {"status": "skipped"}

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
