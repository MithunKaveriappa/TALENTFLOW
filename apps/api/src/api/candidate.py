from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.core.supabase import supabase
from pydantic import BaseModel
from src.services.resume_service import ResumeService
from src.core.config import GOOGLE_API_KEY

router = APIRouter(prefix="/candidate", tags=["candidate"])

class ExperienceBandUpdate(BaseModel):
    experience: str

class ResumeUpdate(BaseModel):
    resume_path: str

class SkillsUpdate(BaseModel):
    skills: list[str]

class StepUpdate(BaseModel):
    step: str

@router.get("/profile")
def get_profile(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        res = supabase.table("candidate_profiles").select("*").eq("user_id", user_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/step")
def update_step(
    request: StepUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        supabase.table("candidate_profiles").update({
            "onboarding_step": request.step
        }).eq("user_id", user_id).execute()
        return {"status": "step_updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experience")
def update_experience(
    request: ExperienceBandUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    valid_bands = ["fresher", "mid", "senior", "leadership"]
    if request.experience not in valid_bands:
        raise HTTPException(status_code=400, detail="Invalid experience band")
    
    try:
        supabase.table("candidate_profiles").update({
            "experience": request.experience
        }).eq("user_id", user_id).execute()
        
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resume")
async def update_resume(
    request: ResumeUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    try:
        # 1. Mark as uploaded in profile
        supabase.table("candidate_profiles").update({
            "resume_uploaded": True
        }).eq("user_id", user_id).execute()
        
        # 2. Trigger Parsing (In dev, we'll do it sync. For prod, use BackgroundTasks)
        if GOOGLE_API_KEY:
            parsed_data = await ResumeService.parse_resume(user_id, request.resume_path, GOOGLE_API_KEY)
            return {"status": "resume_linked", "parsed": True, "data": parsed_data}
        
        return {"status": "resume_linked", "parsed": False, "message": "Resume uploaded but parsing skipped (missing API Key)"}
    except Exception as e:
        print(f"Resume Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skills")
def update_skills(
    request: SkillsUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    try:
        # Update both the skills list, step, and assessment status
        supabase.table("candidate_profiles").update({
            "skills": request.skills,
            "onboarding_step": "CONSENT",
            "assessment_status": "not_started"
        }).eq("user_id", user_id).execute()
        
        return {"status": "skills_updated", "next": "assessment"}
    except Exception as e:
        print(f"Update Skills Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
