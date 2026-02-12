from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_user
from src.services.assessment_service import assessment_service
from src.core.supabase import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class AnswerSubmission(BaseModel):
    question_id: Optional[str] = None
    category: str
    answer: str
    difficulty: str
    metadata: dict = {}

@router.post("/start")
async def start_assessment(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    # Check if blocked
    blocked_res = supabase.table("blocked_users").select("*").eq("user_id", user_id).execute()
    if blocked_res.data:
        raise HTTPException(status_code=403, detail="Your account has been permanently blocked due to security violations.")
    
    session = await assessment_service.get_or_create_session(user_id)
    return session

@router.get("/next")
async def get_next_question(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    # Check if blocked
    blocked_res = supabase.table("blocked_users").select("*").eq("user_id", user_id).execute()
    if blocked_res.data:
        raise HTTPException(status_code=403, detail="Your account has been permanently blocked.")

    question = await assessment_service.get_next_question(user_id)
    return question

@router.post("/submit")
async def submit_answer(submission: AnswerSubmission, user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    # Check if blocked
    blocked_res = supabase.table("blocked_users").select("*").eq("user_id", user_id).execute()
    if blocked_res.data:
        raise HTTPException(status_code=403, detail="Your account has been permanently blocked.")

    result = await assessment_service.evaluate_answer(
        user_id, 
        submission.question_id,
        submission.category,
        submission.answer,
        submission.difficulty,
        submission.metadata
    )
    return result

@router.post("/tab-switch")
async def handle_tab_switch(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    
    # 1. Increment switch count in the session
    session_res = supabase.table("assessment_sessions").select("warning_count").eq("candidate_id", user_id).execute()
    
    current_count = 0
    if session_res.data and len(session_res.data) > 0:
        current_count = session_res.data[0].get("warning_count", 0)
    
    new_count = current_count + 1
    
    # Update count
    supabase.table("assessment_sessions").update({"warning_count": new_count}).eq("candidate_id", user_id).execute()
    
    if new_count >= 2:
        # BAN USER
        supabase.table("blocked_users").insert({
            "user_id": user_id,
            "reason": "Security violation: Multiple tab switches during assessment."
        }).execute()
        
        # Update candidate status
        supabase.table("candidate_profiles").update({"assessment_status": "disqualified"}).eq("user_id", user_id).execute()
        
        return {"status": "blocked", "message": "Security violation detected. You have been permanently blocked. Any further access is denied."}
    
    return {"status": "warning", "message": "Final warning: Tab switching is strictly prohibited. Your next attempt will result in a permanent ban."}

@router.get("/results")
async def get_results(user: dict = Depends(get_current_user)):
    user_id = user["sub"]
    
    # 1. Fetch current session (Safe fetch)
    res = supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
    if not res.data:
        return None  # Return null so frontend shows onboarding prompt
    
    session = res.data[0]
    
    # 2. FORCE RE-CALCULATION if status is completed
    if session.get("status") == "completed":
        await assessment_service.complete_assessment(user_id, session)
        # Refetch to get updated values
        res = supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
        return res.data[0]
        
    return session
