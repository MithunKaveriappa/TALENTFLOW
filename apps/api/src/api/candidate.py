from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.core.supabase import async_supabase as supabase
from pydantic import BaseModel
from src.services.resume_service import ResumeService
from src.services.candidate_service import CandidateService
from src.services.notification_service import NotificationService
from src.utils.pdf_generator import PDFGenerator
from src.schemas.candidate import CandidateProfileUpdate, CandidateStats, CandidateJobResponse, JobApplicationResponse
from src.core.config import GOOGLE_API_KEY
from typing import List, Optional

router = APIRouter(prefix="/candidate", tags=["candidate"])

class ExperienceBandUpdate(BaseModel):
    experience: str

class ResumeUpdate(BaseModel):
    resume_path: str

class SkillsUpdate(BaseModel):
    skills: list[str]

class StepUpdate(BaseModel):
    step: str

class EducationData(BaseModel):
    degree: str
    institution: str
    year: str

class ExperienceData(BaseModel):
    role: str
    company: str
    start: str
    end: str
    description: Optional[str] = None

class GenerateResumeRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    bio: Optional[str] = None
    education: EducationData
    timeline: List[ExperienceData]
    skills: List[str]
    template: str = "professional"

@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        # Use execute() instead of single() to avoid 404/PGRST116 errors
        # Join with users table for email consistency
        res = await supabase.table("candidate_profiles").select("*, users(email)").eq("user_id", user_id).execute()
        if not res.data:
            return None
        profile = res.data[0]
        # Flatten email
        if "users" in profile and profile["users"]:
            profile["email"] = profile["users"].get("email")
        else:
            profile["email"] = user.get("email")
            
        # Add Signed URL for Profile Photo
        if profile.get("profile_photo_url") and not profile["profile_photo_url"].startswith("http"):
            try:
                # Use sync supabase for storage until async is fully vetted for storage.create_signed_url
                from src.core.supabase import supabase as sync_supabase
                signed_url_res = sync_supabase.storage.from_("avatars").create_signed_url(profile["profile_photo_url"], 3600)
                if signed_url_res and "signedURL" in signed_url_res:
                    profile["profile_photo_url"] = signed_url_res["signedURL"]
            except Exception as e:
                print(f"FAILED TO SIGN PROFILE PHOTO: {e}")
                
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/profile")
async def update_profile(
    request: CandidateProfileUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        # 0. Check Integrity Lock
        profile_check = await supabase.table("candidate_profiles").select("assessment_status, experience, years_of_experience").eq("user_id", user_id).execute()
        current_profile = profile_check.data[0] if profile_check.data else {}
        is_completed = current_profile.get("assessment_status") == "completed"

        # 1. Update Profile Fields
        update_data = request.model_dump(exclude_unset=True, by_alias=True)
        
        # SILENT PROTECTION: If assessment is completed, we don't allow changing seniority signals.
        # Instead of erroring out (which blocks profile saves), we just strip them from the payload 
        # to ensure the save succeeds for other fields.
        if is_completed:
            for field in ["experience", "years_of_experience"]:
                if field in update_data:
                    # Log for server-side audit
                    print(f"DEBUG: Stripping locked field {field} from profile update.")
                    del update_data[field]
            
        await supabase.table("candidate_profiles").update(update_data).eq("user_id", user_id).execute()
        
        # 2. Recalculate Completion Score (Safe fetch)
        profile_res = await supabase.table("candidate_profiles").select("*").eq("user_id", user_id).execute()
        if not profile_res.data:
             return {"status": "error", "detail": "Profile not found"}
             
        full_profile = profile_res.data[0]
        completion_score = CandidateService.calculate_completion_score(full_profile)
        
        # 3. Save Score
        await supabase.table("candidate_profiles").update({
            "completion_score": completion_score,
            "updated_at": "now()"
        }).eq("user_id", user_id).execute()
        
        return {"status": "profile_updated", "completion_score": completion_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest-application")
async def get_latest_application(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        res = await supabase.table("job_applications")\
            .select("*, jobs(*, companies(*)), interviews(*, interview_slots(*))")\
            .eq("candidate_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        return res.data[0] if res.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=CandidateStats)
def get_stats(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    try:
        return CandidateService.get_candidate_stats(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/step")
async def update_step(
    request: StepUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        await supabase.table("candidate_profiles").update({
            "onboarding_step": request.step
        }).eq("user_id", user_id).execute()
        return {"status": "step_updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experience")
async def update_experience(
    request: ExperienceBandUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    valid_bands = ["fresher", "mid", "senior", "leadership"]
    if request.experience not in valid_bands:
        raise HTTPException(status_code=400, detail="Invalid experience band")
    
    try:
        # Check integrity lock
        profile_check = await supabase.table("candidate_profiles").select("assessment_status").eq("user_id", user_id).execute()
        if profile_check.data and profile_check.data[0].get("assessment_status") == "completed":
             raise HTTPException(status_code=403, detail="Experience band is locked after assessment completion.")

        await supabase.table("candidate_profiles").update({
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
        # 1. Mark as uploaded in profile and store path
        # Generate a public URL (assuming public bucket, otherwise use signed URL)
        # For simplicity, we store the full path.
        await supabase.table("candidate_profiles").update({
            "resume_uploaded": True,
            "resume_path": request.resume_path
        }).eq("user_id", user_id).execute()
        
        # 2. Trigger Parsing (In dev, we'll do it sync. For prod, use BackgroundTasks)
        if GOOGLE_API_KEY:
            parsed_data = await ResumeService.parse_resume(user_id, request.resume_path, GOOGLE_API_KEY)
            return {"status": "resume_linked", "parsed": True, "data": parsed_data}
        
        return {"status": "resume_linked", "parsed": False, "message": "Resume uploaded but parsing skipped (missing API Key)"}
    except Exception as e:
        print(f"Resume Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-resume")
async def generate_resume(
    request: GenerateResumeRequest,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    try:
        # 1. Prepare data for PDF
        resume_data_dict = request.model_dump()
        
        # 2. Generate PDF using our utility
        pdf_content = PDFGenerator.generate_resume_pdf(resume_data_dict, request.template)
        
        # 3. Upload to Supabase Storage
        file_path = f"resumes/{user_id}-generated.pdf"
        
        # Check if bucket exists/overwrite
        await supabase.storage.from_("resumes").upload(
            file_path, 
            pdf_content, 
            {"content-type": "application/pdf", "x-upsert": "true"}
        )
        
        # 4. Update Profile
        await supabase.table("candidate_profiles").update({
            "resume_uploaded": True,
            "full_name": request.full_name,
            "phone_number": request.phone,
            "location": request.location,
            "bio": request.bio,
            "linkedin_url": request.linkedin,
            "skills": request.skills,
            "current_role": request.timeline[0].role if request.timeline else None,
            "current_company_name": request.timeline[0].company if request.timeline else None
        }).eq("user_id", user_id).execute()
        
        # 5. Store detailed data in resume_data table
        await supabase.table("resume_data").upsert({
            "user_id": user_id,
            "raw_text": f"Generated Resume Content:\n{str(resume_data_dict)}",
            "timeline": [item.model_dump() for item in request.timeline],
            "skills": request.skills,
            "education": request.education.model_dump(),
            "achievements": [request.bio] if request.bio else []
        }).execute()
        
        return {"status": "resume_generated", "path": file_path}
    except Exception as e:
        print(f"Resume Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skills")
async def update_skills(
    request: SkillsUpdate,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    
    try:
        # Update skills and progress step
        await supabase.table("candidate_profiles").update({
            "skills": request.skills,
            "onboarding_step": "AWAITING_ID"
        }).eq("user_id", user_id).execute()
        
        return {"status": "skills_updated", "next": "id_verification"}
    except Exception as e:
        print(f"Update Skills Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-id")
async def verify_id(
    request: dict, # {id_path: str}
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        await supabase.table("candidate_profiles").update({
            "identity_verified": True,
            "onboarding_step": "AWAITING_TC"
        }).eq("user_id", user_id).execute()
        return {"status": "id_uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/accept-tc")
async def accept_tc(
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    try:
        await supabase.table("candidate_profiles").update({
            "terms_accepted": True,
            "onboarding_step": "COMPLETED",
            "assessment_status": "not_started"
        }).eq("user_id", user_id).execute()

        NotificationService.create_notification(
            user_id=user_id,
            type="ONBOARDING_COMPLETED",
            title="Profile Synchronized",
            message="Your high-trust profile is now fully active. You can now transmit signals to enterprise recruiters."
        )
        return {"status": "tc_accepted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- JOB DISCOVERY & APPLICATIONS ---

@router.get("/jobs", response_model=List[CandidateJobResponse])
async def list_jobs(user: dict = Depends(get_current_user)):
    """Fetch available jobs for the candidate."""
    return await CandidateService.list_available_jobs(user["sub"])

@router.post("/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, user: dict = Depends(get_current_user)):
    """Apply for a job."""
    return await CandidateService.apply_to_job(user["sub"], job_id)

@router.get("/applications", response_model=List[JobApplicationResponse])
async def list_applications(user: dict = Depends(get_current_user)):
    """Fetch jobs user has applied to."""
    return await CandidateService.get_my_applications(user["sub"])
