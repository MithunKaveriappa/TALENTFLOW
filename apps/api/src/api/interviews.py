from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.dependencies import get_current_user
from src.services.interview_service import interview_service
from src.schemas.interview import (
    InterviewProposeRequest, 
    InterviewConfirmRequest, 
    InterviewCancelRequest,
    InterviewFeedbackRequest,
    InterviewResponse
)
from src.core.supabase import supabase

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/propose", response_model=InterviewResponse)
async def propose_interview(
    request: InterviewProposeRequest,
    user: dict = Depends(get_current_user)
):
    """Recruiter proposes an interview with slots."""
    if user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can propose interviews")
    
    try:
        return await interview_service.propose_interview(user["id"], request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm", response_model=dict)
async def confirm_interview(
    request: InterviewConfirmRequest,
    user: dict = Depends(get_current_user)
):
    """Candidate confirms one of the slots."""
    if user.get("role") != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can confirm slots")
    
    try:
        return await interview_service.confirm_slot(user["id"], request.slot_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{interview_id}/cancel")
async def cancel_interview(
    interview_id: str,
    request: InterviewCancelRequest,
    user: dict = Depends(get_current_user)
):
    """Cancel an interview."""
    try:
        return await interview_service.cancel_interview(
            user["id"], 
            interview_id, 
            request.reason, 
            user.get("role")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{interview_id}/feedback")
async def submit_feedback(
    interview_id: str,
    request: InterviewFeedbackRequest,
    user: dict = Depends(get_current_user)
):
    """Submit feedback and decide on next steps."""
    if user.get("role") != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can submit feedback")
    
    try:
        return await interview_service.submit_feedback(
            user["id"], 
            interview_id, 
            request.feedback, 
            request.next_status
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my", response_model=List[InterviewResponse])
async def get_my_interviews(user: dict = Depends(get_current_user)):
    """Fetch all interviews for the current user."""
    user_id = user["id"]
    role = user.get("role")
    
    query = supabase.table("interviews").select("*, slots:interview_slots(*)")
    
    if role == "recruiter":
        query = query.eq("recruiter_id", user_id)
    else:
        query = query.eq("candidate_id", user_id)
    
    res = query.order("created_at", desc=True).execute()
    return res.data
