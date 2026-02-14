from src.core.supabase import supabase
from typing import Dict, Any
from src.services.notification_service import NotificationService

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
                "daily_applications_count": 0,
                "shortlisted_count": 0,
                "invites_received": 0,
                "posts_count": 0,
                "saved_jobs_count": 0,
                "profile_score": 0,
                "profile_strength": "Low",
                "completion_score": 0,
                "assessment_status": "not_started",
                "identity_verified": False,
                "terms_accepted": False,
                "account_status": "Active",
            }
        
        profile = profile_res.data[0]
        
        # 2. Fetch Engagement Counts
        apps_res = supabase.table("job_applications").select("status", count="exact").eq("candidate_id", user_id).execute()
        applications_count = apps_res.count or 0

        # Daily count for quota display
        from datetime import date
        today = date.today().isoformat()
        daily_count_res = supabase.table("job_applications").select("id", count="exact")\
            .eq("candidate_id", user_id).gte("created_at", today).execute()
        daily_applications_count = daily_count_res.count or 0
        
        shortlisted_count = supabase.table("job_applications").select("status", count="exact")\
            .eq("candidate_id", user_id).eq("status", "shortlisted").execute().count or 0
            
        invites_count = supabase.table("job_applications").select("status", count="exact")\
            .eq("candidate_id", user_id).eq("status", "invited").execute().count or 0
            
        posts_count = supabase.table("posts").select("id", count="exact").eq("user_id", user_id).execute().count or 0
        
        saved_jobs_count = supabase.table("saved_jobs").select("id", count="exact").eq("candidate_id", user_id).execute().count or 0

        return {
            "applications_count": applications_count,
            "daily_applications_count": daily_applications_count,
            "shortlisted_count": shortlisted_count,
            "invites_received": invites_count,
            "posts_count": posts_count,
            "saved_jobs_count": saved_jobs_count,
            "profile_score": profile.get("final_profile_score"),
            "profile_strength": profile.get("profile_strength", "Low"),
            "completion_score": profile.get("completion_score", 0),
            "assessment_status": profile.get("assessment_status", "not_started"),
            "identity_verified": profile.get("identity_verified", False),
            "terms_accepted": profile.get("terms_accepted", False),
            "account_status": profile.get("account_status", "Active"),
        }

    @staticmethod
    async def list_available_jobs(user_id: str):
        """Fetch active jobs with company info and application status."""
        # 1. Fetch active jobs with company data
        jobs_res = supabase.table("jobs").select("*, companies(name, website)").eq("status", "active").order("created_at", desc=True).execute()
        
        # 2. Fetch user's applications
        apps_res = supabase.table("job_applications").select("job_id").eq("candidate_id", user_id).execute()
        applied_job_ids = {a["job_id"] for a in apps_res.data}
        
        jobs = []
        for j in jobs_res.data:
            company = j.get("companies", {})
            
            # Mapping for schema resilience (similar to recruiter_service)
            title = j.get("title")
            description = j.get("description")
            # If columns missing, they might find themselves in metadata
            metadata = j.get("metadata", {}) if isinstance(j.get("metadata"), dict) else {}
            
            experience_band = j.get("experience_band")
            location = j.get("location")
            salary_range = j.get("salary_range")
            job_type = j.get("job_type", "onsite")
            
            jobs.append({
                "id": j["id"],
                "title": title,
                "description": description,
                "experience_band": experience_band,
                "location": location,
                "salary_range": salary_range,
                "job_type": job_type,
                "company_name": company.get("name", "Unknown Company"),
                "company_website": company.get("website"),
                "created_at": j["created_at"],
                "has_applied": j["id"] in applied_job_ids
            })
            
        return jobs

    @staticmethod
    async def apply_to_job(user_id: str, job_id: str):
        """Create a new job application with daily limits."""
        # 1. Check if already applied
        existing = supabase.table("job_applications").select("id").eq("candidate_id", user_id).eq("job_id", job_id).execute()
        if existing.data:
            return {"status": "already_applied"}
            
        # 2. Enforce Daily Limit (5 applications)
        from datetime import datetime, date
        today = date.today().isoformat()
        
        # Count apps created today
        daily_count_res = supabase.table("job_applications")\
            .select("id", count="exact")\
            .eq("candidate_id", user_id)\
            .gte("created_at", today)\
            .execute()
            
        if (daily_count_res.count or 0) >= 5:
            return {
                "status": "limit_reached", 
                "message": "Daily transmission limit reached (5/5). Your signal buffer will reset tomorrow."
            }

        # 3. Create application
        res = supabase.table("job_applications").insert({
            "candidate_id": user_id,
            "job_id": job_id,
            "status": "applied"
        }).execute()
        
        # 4. Trigger Notification
        if res.data:
            # Fetch job title for better message
            job_data = supabase.table("jobs").select("title").eq("id", job_id).single().execute()
            job_title = job_data.data.get("title", "a job") if job_data.data else "a job"
            NotificationService.create_notification(
                user_id=user_id,
                type="APPLICATION_SUBMITTED",
                title="Application Sent",
                message=f"Your signal for {job_title} has been successfully transmitted to the recruiter.",
                metadata={"job_id": job_id}
            )

        return {"status": "success", "data": res.data[0] if res.data else None}

    @staticmethod
    async def get_my_applications(user_id: str):
        """Fetch all jobs the candidate has applied to."""
        res = supabase.table("job_applications")\
            .select("*, jobs(title, companies(name))")\
            .eq("candidate_id", user_id)\
            .order("created_at", desc=True).execute()
        
        apps = []
        for a in res.data:
            job = a.get("jobs", {})
            company = job.get("companies", {})
            apps.append({
                "id": a["id"],
                "job_id": a["job_id"],
                "status": a["status"],
                "applied_at": a["created_at"],
                "job_title": job.get("title", "Unknown Role"),
                "company_name": company.get("name", "Unknown Company")
            })
            
        return apps
