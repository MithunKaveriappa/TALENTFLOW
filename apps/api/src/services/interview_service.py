from typing import List, Dict, Optional
from datetime import datetime
import uuid
from src.core.supabase import supabase
from src.schemas.interview import (
    InterviewProposeRequest, 
    InterviewStatus, 
    InterviewFormat
)

class InterviewService:
    @staticmethod
    async def propose_interview(user_id: str, request: InterviewProposeRequest):
        """
        Recruiter proposes an interview with multiple slots.
        """
        # 1. Verify application exists and recruiter owns the job
        app_res = supabase.table("job_applications").select("*, jobs(*)").eq("id", request.application_id).execute()
        if not app_res.data:
            raise ValueError("Application not found")
        
        app = app_res.data[0]
        if app["jobs"]["recruiter_id"] != user_id:
            raise ValueError("Unauthorized: You do not manage this job")

        # 2. Create Interview Record
        interview_data = {
            "job_id": app["job_id"],
            "candidate_id": app["candidate_id"],
            "recruiter_id": user_id,
            "application_id": request.application_id,
            "round_name": request.round_name,
            "round_number": request.round_number,
            "format": request.format,
            "location": request.location,
            "interviewer_names": request.interviewer_names,
            "status": InterviewStatus.PENDING
        }

        # Generate Jitsi Link if virtual
        if request.format == InterviewFormat.VIRTUAL:
            room_id = f"tf-{uuid.uuid4().hex[:8]}"
            interview_data["meeting_link"] = f"https://meet.jit.si/{room_id}"

        int_res = supabase.table("interviews").insert(interview_data).execute()
        if not int_res.data:
            raise Exception("Failed to create interview")
        
        interview = int_res.data[0]

        # 3. Create Slots
        slots_data = []
        for slot in request.slots:
            slots_data.append({
                "interview_id": interview["id"],
                "start_time": slot.start_time.isoformat(),
                "end_time": slot.end_time.isoformat()
            })
        
        supabase.table("interview_slots").insert(slots_data).execute()

        # 4. Notify Candidate
        from src.services.notification_service import NotificationService
        NotificationService.create_notification(
            user_id=app["candidate_id"],
            type="INTERVIEW_PROPOSED",
            title="Interview Invitation",
            message=f"A recruiter has proposed an interview for {app['jobs']['title']}. Please select a time slot.",
            metadata={
                "interview_id": interview["id"],
                "application_id": request.application_id,
                "job_title": app["jobs"]["title"]
            }
        )
        
        return interview

    @staticmethod
    async def confirm_slot(user_id: str, slot_id: str):
        """
        Candidate confirms one of the proposed slots.
        """
        # 1. Get slot and verify candidate owns the interview
        slot_res = supabase.table("interview_slots").select("*, interviews(*)").eq("id", slot_id).execute()
        if not slot_res.data:
            raise ValueError("Slot not found")
        
        slot = slot_res.data[0]
        if slot["interviews"]["candidate_id"] != user_id:
            raise ValueError("Unauthorized")
        
        interview_id = slot["interview_id"]

        # 2. Update Slot selection
        supabase.table("interview_slots").update({"is_selected": True}).eq("id", slot_id).execute()
        # Unselect others (optional but good for data integrity)
        supabase.table("interview_slots").update({"is_selected": False}).eq("interview_id", interview_id).neq("id", slot_id).execute()

        # 3. Update Interview Status
        supabase.table("interviews").update({
            "status": InterviewStatus.SCHEDULED,
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).execute()

        # 4. Update Application Status to 'interview_scheduled'
        supabase.table("job_applications").update({
            "status": "interview_scheduled",
            "updated_at": datetime.now().isoformat()
        }).eq("id", slot["interviews"]["application_id"]).execute()

        # 5. Notify Recruiter
        from src.services.notification_service import NotificationService
        NotificationService.create_notification(
            user_id=slot["interviews"]["recruiter_id"],
            type="INTERVIEW_CONFIRMED",
            title="Interview Slot Confirmed",
            message=f"A candidate has confirmed a slot for your interview proposal on {slot['start_time']}.",
            metadata={
                "interview_id": interview_id,
                "application_id": slot["interviews"]["application_id"]
            }
        )

        return {"status": "success", "interview_id": interview_id}

    @staticmethod
    async def cancel_interview(user_id: str, interview_id: str, reason: str, role: str):
        """
        Recruiter or Candidate cancels an interview.
        """
        # 1. Fetch interview
        res = supabase.table("interviews").select("*").eq("id", interview_id).execute()
        if not res.data:
            raise ValueError("Interview not found")
        
        interview = res.data[0]
        
        # 2. Check authorization
        if role == "recruiter" and interview["recruiter_id"] != user_id:
            raise ValueError("Unauthorized")
        if role == "candidate" and interview["candidate_id"] != user_id:
            raise ValueError("Unauthorized")

        # 3. Update status
        supabase.table("interviews").update({
            "status": InterviewStatus.CANCELLED,
            "cancellation_reason": reason,
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).execute()

        # 4. Revert application status if needed? 
        # Usually it stays 'shortlisted' if cancelled before happening
        supabase.table("job_applications").update({
            "status": "shortlisted",
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview["application_id"]).execute()

        # 5. Notify the other party
        from src.services.notification_service import NotificationService
        target_id = interview["candidate_id"] if role == "recruiter" else interview["recruiter_id"]
        NotificationService.create_notification(
            user_id=target_id,
            type="INTERVIEW_CANCELLED",
            title=f"Interview Cancelled: {interview['round_name']}",
            message=f"The {role} has cancelled the scheduled interview. Reason: {reason}",
            metadata={
                "interview_id": interview_id,
                "application_id": interview["application_id"]
            }
        )

        return {"status": "cancelled"}

    @staticmethod
    async def submit_feedback(user_id: str, interview_id: str, feedback: str, next_status: str):
        """
        Recruiter submits feedback and transitions candidate status.
        """
        # 1. Verify recruiter
        res = supabase.table("interviews").select("*").eq("id", interview_id).execute()
        if not res.data:
            raise ValueError("Interview not found")
        
        interview = res.data[0]
        if interview["recruiter_id"] != user_id:
            raise ValueError("Unauthorized")

        # 2. Update Interview
        supabase.table("interviews").update({
            "status": InterviewStatus.COMPLETED,
            "feedback": feedback,
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview_id).execute()

        # 3. Update Application with Decision
        supabase.table("job_applications").update({
            "status": next_status,
            "feedback": feedback, # High level feedback for candidate
            "updated_at": datetime.now().isoformat()
        }).eq("id", interview["application_id"]).execute()

        # 4. Trigger Notifications based on Decision
        from src.services.notification_service import NotificationService
        if next_status == "offered":
            NotificationService.create_notification(
                user_id=interview["candidate_id"],
                type="OFFER_RECEIVED",
                title="Job Offer Received!",
                message=f"Congratulations! You have received a job offer following your {interview['round_name']}.",
                metadata={"application_id": interview["application_id"]}
            )
        elif next_status == "rejected":
            NotificationService.create_notification(
                user_id=interview["candidate_id"],
                type="APPLICATION_REJECTED",
                title="Application Update",
                message=f"Thank you for interviewing for this position. The recruiter has decided not to move forward at this time.",
                metadata={"application_id": interview["application_id"]}
            )
        elif next_status == "shortlisted":
            NotificationService.create_notification(
                user_id=interview["candidate_id"],
                type="INTERVIEW_PASSED",
                title="Interview Feedback Received",
                message=f"Great news! You have passed the {interview['round_name']}. The recruiter will be scheduling the next round soon.",
                metadata={"application_id": interview["application_id"]}
            )

        return {"status": "completed", "decision": next_status}

    @staticmethod
    async def register_join_event(user_id: str, interview_id: str, role: str):
        """
        Notify the other party that someone has joined the meeting.
        """
        # 1. Fetch interview
        res = supabase.table("interviews").select("*").eq("id", interview_id).execute()
        if not res.data:
            raise ValueError("Interview not found")
        
        interview = res.data[0]
        
        # 2. Determine recipient and message
        from src.services.notification_service import NotificationService
        
        if role == "recruiter":
            # Recruiter joined -> Notify candidate
            recipient_id = interview["candidate_id"]
            title = "Recruiter has Joined"
            message = "Your interviewer has entered the meeting room and is waiting for you."
            notif_type = "INTERVIEW_READY"
        else:
            # Candidate joined -> Notify recruiter
            recipient_id = interview["recruiter_id"]
            title = "Candidate holds Protocol"
            message = f"Candidate for {interview['round_name']} has entered the meeting room."
            notif_type = "CANDIDATE_JOINED"

        NotificationService.create_notification(
            user_id=recipient_id,
            type=notif_type,
            title=title,
            message=message,
            metadata={"interview_id": interview_id, "application_id": interview["application_id"]}
        )
        
        return {"status": "event_registered"}

interview_service = InterviewService()
