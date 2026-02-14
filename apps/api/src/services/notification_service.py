from src.core.supabase import supabase

class NotificationService:
    @staticmethod
    def create_notification(user_id: str, type: str, title: str, message: str, metadata: dict = None):
        """Create a notification in the database."""
        try:
            supabase.table("notifications").insert({
                "user_id": user_id,
                "type": type,
                "title": title,
                "message": message,
                "metadata": metadata or {}
            }).execute()
        except Exception as e:
            print(f"Failed to create notification: {e}")
