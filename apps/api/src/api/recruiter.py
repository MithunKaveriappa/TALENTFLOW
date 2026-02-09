from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.services.recruiter_service import recruiter_service
from src.core.supabase import supabase
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

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
    
    # 1. Increment switch count
    profile_res = supabase.table("recruiter_profiles").select("warning_count").eq("user_id", user_id).single().execute()
    
    current_count = profile_res.data.get("warning_count", 0) if profile_res.data else 0
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
