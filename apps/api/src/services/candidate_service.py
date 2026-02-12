from src.core.supabase import supabase
from typing import Dict, Any

class CandidateService:
    @staticmethod
    def calculate_completion_score(profile: Dict[str, Any]) -> int:
        """
        Calculates the profile completion score (0-100) based on filled fields.
        """
        weights = {
            "full_name": 10,
            "phone_number": 5,
            "bio": 10,
            "current_role": 10,
            "years_of_experience": 5,
            "primary_industry_focus": 5,
            "current_company_name": 5,
            "skills": 10,
            "linkedin_url": 5,
            "portfolio_url": 5,
            "sales_metrics": 10,
            "crm_tools": 5,
            "sales_methodologies": 5,
            "resume_uploaded": 10,
        }
        
        total_score = 0
        max_score = sum(weights.values())
        
        for field, weight in weights.items():
            val = profile.get(field)
            if val and (not isinstance(val, (list, dict)) or len(val) > 0):
                total_score += weight
        
        return int((total_score / max_score) * 100)

    @staticmethod
    def get_candidate_stats(user_id: str) -> Dict[str, Any]:
        """
        Fetches all engagement and profile stats for the candidate.
        """
        # 1. Fetch Profile Data (Safe fetch to avoid 404)
        profile_res = supabase.table("candidate_profiles").select("*").eq("user_id", user_id).execute()
        if not profile_res.data:
            return {
                "applications_count": 0,
                "shortlisted_count": 0,
                "invites_received": 0,
                "posts_count": 0,
                "saved_jobs_count": 0,
                "profile_score": 0,
                "profile_strength": "Low",
                "completion_score": 0,
                "assessment_status": "not_started",
                "identity_verified": False,
                "account_status": "Active",
            }
        
        profile = profile_res.data[0]
        
        # 2. Fetch Engagement Counts
        apps_res = supabase.table("job_applications").select("status", count="exact").eq("candidate_id", user_id).execute()
        applications_count = apps_res.count or 0
        
        shortlisted_count = supabase.table("job_applications").select("status", count="exact")\
            .eq("candidate_id", user_id).eq("status", "shortlisted").execute().count or 0
            
        invites_count = supabase.table("job_applications").select("status", count="exact")\
            .eq("candidate_id", user_id).eq("status", "invited").execute().count or 0
            
        posts_count = supabase.table("posts").select("id", count="exact").eq("user_id", user_id).execute().count or 0
        
        saved_jobs_count = supabase.table("saved_jobs").select("id", count="exact").eq("candidate_id", user_id).execute().count or 0

        return {
            "applications_count": applications_count,
            "shortlisted_count": shortlisted_count,
            "invites_received": invites_count,
            "posts_count": posts_count,
            "saved_jobs_count": saved_jobs_count,
            "profile_score": profile.get("final_profile_score"),
            "profile_strength": profile.get("profile_strength", "Low"),
            "completion_score": profile.get("completion_score", 0),
            "assessment_status": profile.get("assessment_status", "not_started"),
            "identity_verified": profile.get("identity_verified", False),
            "account_status": profile.get("account_status", "Active"),
        }
