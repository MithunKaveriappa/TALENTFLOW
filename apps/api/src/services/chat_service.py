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
            return response.data[0]

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
        """
        # Verify thread is active
        thread = supabase.table("chat_threads").select("is_active").eq("id", thread_id).single().execute()
        if not thread.data or not thread.data.get("is_active"):
            raise ValueError("Cannot send message to an inactive thread.")

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
