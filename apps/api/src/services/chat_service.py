from typing import List, Optional
from datetime import datetime
from ..core.supabase import supabase

class ChatService:
    @staticmethod
    def get_or_create_thread(recruiter_id: str, candidate_id: str) -> dict:
        """
        Retrieves an existing thread or creates a new one for the recruiter-candidate pair.
        """
        # Check for existing thread
        response = supabase.table("chat_threads").select("*").match({
            "recruiter_id": recruiter_id,
            "candidate_id": candidate_id
        }).execute()

        if response.data:
            thread = response.data[0]
            if not thread.get("is_active"):
                # Unlock existing thread if it was previously inactive
                update_res = supabase.table("chat_threads").update({"is_active": True}).eq("id", thread["id"]).execute()
                return update_res.data[0]
            return thread

        # Create new thread
        new_thread = {
            "recruiter_id": recruiter_id,
            "candidate_id": candidate_id,
            "is_active": True
        }
        create_response = supabase.table("chat_threads").insert(new_thread).execute()
        return create_response.data[0]

    @staticmethod
    def send_message(thread_id: str, sender_id: str, content: str) -> dict:
        """
        Sends a message within a thread.
        Includes a gate check for Behavioral and Psychometric assessment completion.
        """
        # 1. Fetch thread and candidate status
        thread_res = supabase.table("chat_threads").select("*, candidate_id").eq("id", thread_id).execute()
        if not thread_res.data:
            raise ValueError("Thread not found")
        
        thread = thread_res.data[0]
        if not thread.get("is_active"):
            raise ValueError("Cannot send message to an inactive thread.")

        candidate_id = thread["candidate_id"]

        # 2. Gate Check: Behavioral & Psychometric scores must be >= 50 (DNA Gate)
        session_res = supabase.table("assessment_sessions").select("component_scores, status").eq("candidate_id", candidate_id).execute()
        
        dna_unlocked = False
        if session_res.data:
            session = session_res.data[0]
            if session.get("status") == "completed":
                scores = session.get("component_scores", {})
                beh_score = scores.get("behavioral", 0)
                psy_score = scores.get("psychometric", 0)
                if beh_score >= 50 and psy_score >= 50:
                    dna_unlocked = True

        # 3. Contextual Status Check (Status Gate - Messaging Manifesto 8.1)
        # Determine the company context
        recruiter_id = thread["recruiter_id"]
        recruiter_res = supabase.table("recruiter_profiles").select("company_id").eq("user_id", recruiter_id).execute()
        if not recruiter_res.data:
            raise ValueError("Recruiter context not found")
        company_id = recruiter_res.data[0].get("company_id")

        # Fetch applications linked to this company
        # Valid statuses to unlock chat: shortlisted, invited, interview_scheduled, offered, recommended
        unlocked_statuses = ['shortlisted', 'invited', 'interview_scheduled', 'offered', 'recommended']
        valid_apps = supabase.table("job_applications").select("status, jobs!inner(company_id)")\
            .eq("candidate_id", candidate_id)\
            .eq("jobs.company_id", company_id)\
            .execute()

        context_unlocked = any(a['status'] in unlocked_statuses for a in valid_apps.data)

        # 4. Final Unlock Logic (OR)
        if not (dna_unlocked or context_unlocked):
            raise ValueError("Chat Locked: Communications unlock when Candidate DNA Score >= 50 OR Application is Shortlisted/Invited.")

        message = {
            "thread_id": thread_id,
            "sender_id": sender_id,
            "content": content
        }
        
        # Insert message
        response = supabase.table("chat_messages").insert(message).execute()
        
        # Update thread's last_message_at
        supabase.table("chat_threads").update({
            "last_message_at": datetime.utcnow().isoformat()
        }).eq("id", thread_id).execute()

        return response.data[0]

    @staticmethod
    def get_thread_messages(thread_id: str, limit: int = 50) -> List[dict]:
        """
        Retrieves message history for a thread.
        """
        response = supabase.table("chat_messages").select("*").eq("thread_id", thread_id).order("created_at", desc=True).limit(limit).execute()
        return response.data

    @staticmethod
    def get_user_threads(user_id: str, role: str) -> List[dict]:
        """
        Retrieves all active threads for a user (candidate or recruiter).
        """
        field = "recruiter_id" if role == "recruiter" else "candidate_id"
        
        # We also need the profile info for the other party
        other_party = "candidate_profiles(full_name, avatar_url)" if role == "recruiter" else "recruiter_profiles(full_name, company_name)"
        
        response = supabase.table("chat_threads").select(f"*, {other_party}").eq(field, user_id).order("last_message_at", desc=True).execute()
        return response.data

    @staticmethod
    def report_message(message_id: str, reporter_id: str, reason: str) -> dict:
        """
        Reports a message for moderation.
        """
        report = {
            "message_id": message_id,
            "reporter_id": reporter_id,
            "reason": reason,
            "status": "pending"
        }
        response = supabase.table("chat_reports").insert(report).execute()
        return response.data[0]
