from fastapi import APIRouter, Depends, HTTPException, Body
from src.core.dependencies import get_current_user
from src.core.supabase import supabase
from pydantic import BaseModel, EmailStr

router = APIRouter(tags=["auth"])

class EmailValidationRequest(BaseModel):
    email: EmailStr
    role: str

class ProfileInitializeRequest(BaseModel):
    role: str
    display_name: str

PERSONAL_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
    "me.com", "msn.com", "live.com", "aol.com", "zoho.com",
    "protonmail.com", "proton.me", "yandex.com", "mail.com", "gmx.com",
    "rediffmail.com", "rocketmail.com", "tutanota.com", "fastmail.com", "hushmail.com"
]

@router.post("/validate-email")
def validate_email(request: EmailValidationRequest):
    domain = request.email.split("@")[1].lower()
    is_personal = domain in PERSONAL_DOMAINS
    
    if request.role == "candidate" and not is_personal:
        raise HTTPException(status_code=400, detail="Candidates must use a personal email address")
    
    if request.role == "recruiter" and is_personal:
        raise HTTPException(status_code=400, detail="Recruiters must use a professional email address")
    
    return {"status": "valid"}

@router.post("/initialize")
def initialize_profile(
    request: ProfileInitializeRequest,
    user: dict = Depends(get_current_user)
):
    user_id = user["sub"]
    email = user["email"]
    
    # 1. Create user in public.users
    try:
        supabase.table("users").upsert({
            "id": user_id,
            "email": email,
            "role": request.role
        }).execute()
        
        # 2. Create profile based on role
        if request.role == "candidate":
            supabase.table("candidate_profiles").upsert({
                "user_id": user_id,
                "experience": "fresher" # Default, will be updated in workflow
            }).execute()
        elif request.role == "recruiter":
            supabase.table("recruiter_profiles").upsert({
                "user_id": user_id
            }).execute()
            
        return {"status": "initialized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/post-login")
async def post_login(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    email = user["email"]
    
    # Check if blocked
    blocked = supabase.table("blocked_users").select("*").eq("user_id", user_id).execute()
    if blocked.data:
        raise HTTPException(status_code=403, detail="Your account has been permanently blocked due to security violations.")

    try:
        # 1. Fetch user role (removing .single() to handle 0 rows manually)
        user_res = supabase.table("users").select("role").eq("id", user_id).execute()
        
        if not user_res.data:
            # AUTO-RECOVERY: If user exists in Auth but not in public.users
            # This happens if a previous signup was interrupted.
            # We determine role based on email (personal = candidate)
            from src.utils.email_validation import is_personal_email
            
            recovered_role = "candidate" if is_personal_email(email) else "recruiter"
            
            # Initialize them now
            supabase.table("users").upsert({
                "id": user_id,
                "email": email,
                "role": recovered_role
            }).execute()
            
            if recovered_role == "candidate":
                supabase.table("candidate_profiles").upsert({
                    "user_id": user_id,
                    "experience": "fresher"
                }).execute()
            else:
                # Recruiter recovery
                from src.services.recruiter_service import recruiter_service
                await recruiter_service.get_or_create_profile(user_id)
            
            return {
                "next_step": f"/onboarding/{recovered_role}",
                "role": recovered_role,
                "status": "not_started"
            }
        
        role = user_res.data[0]["role"]
        
        # 2. Check assessment status
        if role == "candidate":
            profile_res = supabase.table("candidate_profiles").select("*").eq("user_id", user_id).execute()
        else:
            profile_res = supabase.table("recruiter_profiles").select("*").eq("user_id", user_id).execute()
            
        # Safe access to profile data
        status = "not_started"
        if profile_res.data and len(profile_res.data) > 0:
            status = profile_res.data[0]["assessment_status"]
        
        # 3. Determine next step
        if role == "candidate":
            # RELAXED GATING: Allow dashboard access if basic profile is ready (experience + resume)
            # even if assessment is not completed.
            profile_data = profile_res.data[0] if profile_res.data else {}
            has_experience = profile_data.get("experience") is not None
            has_resume = profile_data.get("resume_uploaded", False)
            
            if status == "completed" or (has_experience and has_resume):
                next_step = "/dashboard/candidate"
            else:
                next_step = "/onboarding/candidate"
        else: # recruiter
            if status == "completed":
                next_step = "/dashboard/recruiter"
            else:
                next_step = "/onboarding/recruiter"
            
        return {
            "next_step": next_step,
            "role": role,
            "status": status
        }
    except Exception as e:
        print(f"Post-Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
