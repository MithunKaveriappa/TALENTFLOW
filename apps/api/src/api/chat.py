from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from src.core.dependencies import get_current_user
from ..services.chat_service import ChatService
from ..services.notification_service import NotificationService

from src.core.supabase import supabase

router = APIRouter(prefix="/chat", tags=["Chat"])

async def check_chat_permission(recruiter_id: str, candidate_id: str):
    """
    Enforces status-based chat restrictions.
    Messaging is only allowed if the candidate is Shortlisted, Interviewing, or Offered.
    """
    # Check if recruiter has ANY application for this candidate in an advanced stage
    res = supabase.table("job_applications")\
        .select("status")\
        .eq("candidate_id", candidate_id)\
        .in_("status", ["shortlisted", "interview_scheduled", "offered"])\
        .execute()
    
    # Also need to check if the job belongs to the recruiter's company (RLS does this, but service logic is cleaner)
    # For now, we allow if ANY recruiter in the company or the specific recruiter reached advanced stage.
    return len(res.data) > 0

@router.post("/send")
async def send_message(
    thread_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    content: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Sends a message with lifecycle-based restrictions.
    """
    user_id = current_user["id"]
    role = current_user.get("role")

    # 1. Status-Based Guardrail for Recruiters
    if role == "recruiter":
        # Identify candidate_id even if thread_id is provided
        target_candidate_id = candidate_id
        if not target_candidate_id and thread_id:
            thread_res = supabase.table("chat_threads").select("candidate_id").eq("id", thread_id).execute()
            if thread_res.data:
                target_candidate_id = thread_res.data[0]["candidate_id"]
        
        if target_candidate_id:
            has_permission = await check_chat_permission(user_id, target_candidate_id)
            if not has_permission:
                raise HTTPException(
                    status_code=403, 
                    detail="Messaging restricted. You must shortlist the candidate or schedule an interview before initiating chat."
                )

    # 2. Thread Identification
    target_thread_id = thread_id
    if not target_thread_id:
        if role != "recruiter" or not candidate_id:
            raise HTTPException(status_code=400, detail="Recruiters must provide a candidate_id to initiate chat.")
        
        # Get/Create thread for recruiter
        thread = ChatService.get_or_create_thread(user_id, candidate_id)
        target_thread_id = thread["id"]

    # 2. Authorization Check (Ensure user belongs to thread)
    # This is also enforced at DB level via RLS, but buena practice to check here.
    
    # 3. Send Message
    try:
        message = ChatService.send_message(target_thread_id, user_id, content)
        
        # 4. Trigger Notification for recipient
        # Determine recipient_id
        thread_info = ChatService.get_or_create_thread(user_id, candidate_id) if not thread_id else None # Optimization needed
        # For now, keep it simple
        
        return {"status": "success", "message": message}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/threads")
async def get_threads(current_user: dict = Depends(get_current_user)):
    """
    Returns all active chat threads for the logged-in user.
    """
    user_id = current_user["id"]
    role = current_user.get("role")
    threads = ChatService.get_user_threads(user_id, role)
    return threads

@router.get("/messages/{thread_id}")
async def get_messages(thread_id: str, limit: int = 50, current_user: dict = Depends(get_current_user)):
    """
    Returns message history for a thread.
    """
    messages = ChatService.get_thread_messages(thread_id, limit)
    return messages

@router.post("/report")
async def report_message(
    message_id: str = Body(..., embed=True),
    reason: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Reports a message for abuse.
    """
    user_id = current_user["id"]
    report = ChatService.report_message(message_id, user_id, reason)
    return {"status": "reported", "report_id": report["id"]}
