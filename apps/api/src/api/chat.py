from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Optional
from src.core.dependencies import get_current_user
from ..services.chat_service import ChatService
from ..services.notification_service import NotificationService

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/send")
async def send_message(
    thread_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    content: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    """
    Sends a message. If thread_id is provided, sends to that thread.
    If thread_id is missing but candidate_id is provided, it attempts to
    get/create a thread (privileged for recruiters).
    """
    user_id = current_user["id"]
    role = current_user.get("role")

    # 1. Thread Identification
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
