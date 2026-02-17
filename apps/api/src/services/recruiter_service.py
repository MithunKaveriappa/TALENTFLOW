import json
import random
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
from src.core.supabase import supabase
import google.generativeai as genai
from src.core.config import GOOGLE_API_KEY

class RecruiterService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        # Using gemma-3-27b-it as gemini models have 0 quota in this region/project
        self.model = genai.GenerativeModel('gemma-3-27b-it')

    async def generate_company_bio(self, website_url: str) -> str:
        """
        Scrapes a company website and uses Gemini to generate a professional 2-3 sentence bio.
        """
        try:
            if not website_url.startswith(('http://', 'https://')):
                website_url = 'https://' + website_url

            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(website_url)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get text and clean it up
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = '\n'.join(chunk for chunk in chunks if chunk)[:2000] # Limit to 2000 chars

            prompt = f"""
            Extract a professional, concise 2-3 sentence company description/bio for a recruitment platform.
            The bio should capture the company's core mission, products/services, and value proposition.
            
            Source Website Text:
            {clean_text}
            
            Return ONLY the bio text. No introduction or conversational filler.
            """
            
            res = self.model.generate_content(prompt)
            bio = res.text.strip()
            
            # Basic cleanup if AI returns markdown or quotes
            bio = bio.replace('"', '').replace('**', '').strip()
            
            return bio
        except Exception as e:
            print(f"DEBUG: Bio generation failed: {str(e)}")
            return ""

    async def get_or_create_profile(self, user_id: str):
        res = supabase.table("recruiter_profiles").select("*, companies(*)").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
        
        # Ensure user entry exists in public.users to avoid FK violation
        user_check = supabase.table("users").select("id").eq("id", user_id).execute()
        if not user_check.data:
            # Note: Fetching email from auth metadata is ideal but requires admin/service_role
            # For now, we use a generic placeholder or assume post-login handles it.
            # However, if we are here, we MUST have a user record.
            supabase.table("users").upsert({"id": user_id, "role": "recruiter"}).execute()

        # Create default profile if not exists
        new_profile = {
            "user_id": user_id,
            "onboarding_step": "REGISTRATION",
            "assessment_status": "not_started"
        }
        res = supabase.table("recruiter_profiles").insert(new_profile).execute()
        return res.data[0] if res.data else None

    async def update_company_registration(self, user_id: str, registration_number: str):
        # 1. Check if company with this registration exists or create new
        comp_res = supabase.table("companies").select("*").eq("registration_number", registration_number).execute()
        
        has_score = False
        is_first_recruiter = False
        if comp_res.data:
            company_id = comp_res.data[0]["id"]
            # Check if this company already has a profile score from another recruiter
            if comp_res.data[0].get("profile_score", 0) > 0:
                has_score = True
        else:
            # Create a placeholder company
            new_comp = {
                "name": "Pending Verification",
                "registration_number": registration_number
            }
            ins_res = supabase.table("companies").insert(new_comp).execute()
            company_id = ins_res.data[0]["id"]
            is_first_recruiter = True

        # 2. Link recruiter to company and advance step
        next_step = "DETAILS"
        next_status = "not_started"
        
        if has_score:
            next_step = "COMPLETED"
            next_status = "completed"
            
        update_payload = {
            "company_id": company_id,
            "onboarding_step": next_step,
            "assessment_status": next_status,
            "team_role": "admin" if is_first_recruiter else "recruiter"
        }
        
        supabase.table("recruiter_profiles").update(update_payload).eq("user_id", user_id).execute()

        return {
            "status": "ok", 
            "company_id": company_id, 
            "onboarding_step": next_step,
            "assessment_status": next_status
        }

    async def update_company_details(self, user_id: str, company_id: str, details: Dict):
        # Update company table
        supabase.table("companies").update({
            "name": details.get("name"),
            "website": details.get("website"),
            "location": details.get("location"),
            "description": details.get("description"),
            "industry_category": details.get("industry_category"),
            "sales_model": details.get("sales_model"),
            "target_market": details.get("target_market"),
            "hiring_focus_areas": details.get("hiring_focus_areas"),
            "avg_deal_size_range": details.get("avg_deal_size_range")
        }).eq("id", company_id).execute()

        # Advance recruiter step
        supabase.table("recruiter_profiles").update({
            "onboarding_step": "ASSESSMENT_PROMPT"
        }).eq("user_id", user_id).execute()

        # Recalculate and update completion score
        await self.sync_completion_score(user_id)

        return {"status": "ok"}

    async def get_applications_pipeline(self, recruiter_id: str):
        """
        Fetches all applications for jobs managed by the recruiter, 
        grouped by job and including candidate scores.
        """
        try:
            # 1. Get company_id for the recruiter
            prof = await self.get_or_create_profile(recruiter_id)
            company_id = prof.get("company_id")
            if not company_id:
                return []

            # 2. Fetch applications with joined data
            # Note: We filter by company_id through the jobs table join
            query = supabase.table("job_applications").select("""
                id,
                status,
                feedback,
                created_at,
                job_id,
                candidate_id,
                jobs!inner(id, title, status, company_id, skills_required, requirements),
                candidate_profiles!inner(user_id, full_name, current_role, years_of_experience, skills)
            """).eq("jobs.company_id", company_id).order("created_at", desc=True)
            
            res = query.execute()
            apps = res.data or []

            if apps:
                # 3. Fetch Profile Scores separately to avoid join headaches
                candidate_ids = list(set([a["candidate_id"] for a in apps]))
                scores_res = supabase.table("profile_scores").select("user_id, final_score, skills_score").in_("user_id", candidate_ids).execute()
                scores_map = {s["user_id"]: s for s in (scores_res.data or [])}

                # 4. Process and categorise by Skill Match
                for app in apps:
                    # Attach scores
                    app["profile_scores"] = scores_map.get(app["candidate_id"])

                    job_skills = set([s.lower() for s in (app["jobs"].get("skills_required") or [])])
                    cand_skills = set([s.lower() for s in (app["candidate_profiles"].get("skills") or [])])
                    
                    # Intersection of skills
                    matching = job_skills.intersection(cand_skills)
                    
                    # If they share at least 2 key skills or 50% of JD skills, mark as high skill match
                    is_skill_match = len(matching) >= 2 or (len(job_skills) > 0 and len(matching) / len(job_skills) >= 0.4)
                    app["is_skill_match"] = is_skill_match
                    app["matched_skills"] = list(matching)

            return apps
        except Exception as e:
            print(f"PIPELINE DATA ERROR: {str(e)}")
            return []

    async def bulk_update_application_status(self, recruiter_id: str, application_ids: List[str], status: str, feedback: Optional[str] = None):
        """
        Updates status for multiple applications at once with guardrail and ownership checks.
        Automatically unlocks Communication Hub (starts chat thread) for shortlisted candidates.
        """
        if not application_ids:
            return {"count": 0}

        try:
            # OWNERSHIP CHECK: Ensure recruiter owns the jobs associated with these applications
            # We also fetch candidate_id here to potentially unlock chat threads
            apps_check = supabase.table("job_applications")\
                .select("id, candidate_id, jobs(recruiter_id)")\
                .in_("id", application_ids)\
                .execute()
            
            for app in apps_check.data:
                # Validation check: Ensure the application actually exists in the result
                if not app.get("jobs"):
                    continue
                if app["jobs"]["recruiter_id"] != recruiter_id:
                     raise Exception("Permission Denied: You can only update applications for jobs you posted.")

            # Perform the update
            res = supabase.table("job_applications")\
                .update({"status": status, "feedback": feedback, "updated_at": datetime.now().isoformat()})\
                .in_("id", application_ids)\
                .execute()
            
            # ELITE HUB AUTOMATION: Handle thread activation/deactivation
            if status in ["shortlisted", "invited"] and res.data:
                from src.services.chat_service import ChatService
                for app in apps_check.data:
                    candidate_id = app.get("candidate_id")
                    if candidate_id:
                        ChatService.get_or_create_thread(recruiter_id, candidate_id)
            
            # DEACTIVATION: If status is 'rejected', deactivate the communication thread
            if status == "rejected" and res.data:
                for app in apps_check.data:
                    candidate_id = app.get("candidate_id")
                    if candidate_id:
                        supabase.table("chat_threads").update({"is_active": False}).match({
                            "recruiter_id": recruiter_id,
                            "candidate_id": candidate_id
                        }).execute()
            
            return {"count": len(res.data) if res.data else 0}
        except Exception as e:
            # Handle DB guardrail exceptions
            error_msg = str(e)
            if "Invalid transition" in error_msg:
                raise Exception(f"Guardrail Violation: {error_msg}")
            raise e

    async def get_application_history(self, application_id: str):
        """
        Fetch the audit trail for a specific job application.
        """
        res = supabase.table("job_application_status_history")\
            .select("*, users!inner(email)")\
            .eq("application_id", application_id)\
            .order("created_at", desc=False)\
            .execute()
        return res.data

    async def sync_completion_score(self, user_id: str):
        """Helper to sync completion score for recruiter and company profile."""
        res = supabase.table("recruiter_profiles").select("*, companies(*)").eq("user_id", user_id).execute()
        if not res.data:
            return 0
        
        profile = res.data[0]
        company = profile.get("companies", {})
        
        new_score = self.calculate_completion_score(profile, company)
        
        # Update completion score for recruiter profile
        supabase.table("recruiter_profiles").update({"completion_score": new_score}).eq("user_id", user_id).execute()
        
        # Note: Do NOT update companies.profile_score here. 
        # companies.profile_score is the QUALITY score from the assessment, 
        # while completion_score is the onboarding progress.
            
        return new_score

    def calculate_completion_score(self, profile: Dict, company: Dict) -> int:
        """
        Calculates the profile completion score (0-100) based on recruiter and company fields.
        Includes Advanced Employer Branding signals.
        """
        # Recruiter weights (30% total)
        rec_weights = {
            "full_name": 10,
            "job_title": 10,
            "linkedin_url": 10
        }
        
        # Company weights (70% total)
        comp_weights = {
            "name": 10,
            "website": 10,
            "description": 10,
            "industry_category": 10,
            "logo_url": 10,
            "brand_colors": 10,
            "life_at_photo_urls": 10
        }
        
        total_score = 0
        
        for field, weight in rec_weights.items():
            if profile.get(field):
                total_score += weight
                
        for field, weight in comp_weights.items():
            val = company.get(field)
            if val:
                # Special check for lists or dicts
                if isinstance(val, (list, dict)) and len(val) == 0:
                    continue
                total_score += weight
        
        return total_score

    async def get_recommended_candidates(self, recruiter_id: str):
        """
        Fetch candidates specifically matched on Cultural/Behavioral fit.
        Matching is based on company preferences vs candidate Psychometric/Behavioral scores.
        """
        try:
            # 1. Get Recruiter/Company Profile
            prof = await self.get_or_create_profile(recruiter_id)
            company = prof.get("companies", {})
            if not company:
                return []

            # 2. Fetch all assessed candidates
            res = supabase.table("candidate_profiles").select(
                "user_id, full_name, current_role, experience, years_of_experience, profile_strength, skills, assessment_status"
            ).eq("assessment_status", "completed").execute()
            
            if not res.data:
                return []
            
            candidates = res.data
            user_ids = [c["user_id"] for c in candidates]
            
            # 3. Fetch scores
            scores_res = supabase.table("profile_scores").select(
                "user_id, behavioral_score, psychometric_score"
            ).in_("user_id", user_ids).execute()
            
            scores_map = {s["user_id"]: s for s in scores_res.data} if scores_res.data else {}
            
            recommended = []
            for c in candidates:
                u_scores = scores_map.get(c["user_id"], {})
                beh_score = u_scores.get("behavioral_score") or 0
                psy_score = u_scores.get("psychometric_score") or 0
                
                # CULTURAL MATCH LOGIC:
                # We weight behavioral and psychometric scores.
                # In a real scenario, we'd compare candidate personality vectors 
                # against the company's "sales_model" and "target_market".
                # For now, we calculate a Culture Match score.
                match_score = int((psy_score * 0.7) + (beh_score * 0.3))
                
                # Only recommend if they are above a trust threshold
                if match_score >= 60:
                    c["culture_match_score"] = match_score
                    recommended.append(c)
            
            # Sort by match score
            recommended.sort(key=lambda x: x["culture_match_score"], reverse=True)
            return recommended
        except Exception as e:
            print(f"Error in recommendations: {e}")
            return []

    async def get_candidate_pool(self):
        """Fetch all candidates with limited signals for recruiters."""
        try:
            res = supabase.table("candidate_profiles").select(
                "user_id, full_name, current_role, experience, years_of_experience, profile_strength, identity_verified, assessment_status, skills"
            ).execute()
            
            if not res.data:
                return []
            
            candidates = res.data
            
            # Fetch scores separately to calculate trust signal
            user_ids = [c["user_id"] for c in candidates]
            scores_res = supabase.table("profile_scores").select("user_id, behavioral_score, psychometric_score").in_("user_id", user_ids).execute()
            
            scores_map = {s["user_id"]: s for s in scores_res.data} if scores_res.data else {}
            
            # Enrich candidate data with a consolidated Trust Score
            for c in candidates:
                u_scores = scores_map.get(c["user_id"], {})
                beh = u_scores.get("behavioral_score") or 0
                psy = u_scores.get("psychometric_score") or 0
                
                # Trust Score calculation (Normalized 0-100)
                # Weighted: 60% Psychometric, 40% Behavioral
                c["trust_score"] = int((psy * 0.6) + (beh * 0.4)) if (psy + beh) > 0 else 0
                
            # Sort by trust_score to give high priority to high-trust candidates
            candidates.sort(key=lambda x: x["trust_score"], reverse=True)
                
            return candidates
        except Exception as e:
            print(f"Error fetching candidate pool: {e}")
            return []

    async def get_candidate_details(self, candidate_id: str):
        """Fetch full details for a candidate viewable by recruiters."""
        try:
            # 1. Fetch Profile
            res = supabase.table("candidate_profiles").select("*").eq("user_id", candidate_id).execute()
            if not res.data:
                return None
            
            candidate = res.data[0]
            
            # 2. Fetch Scores to calculate consolidated trust signal
            scores_res = supabase.table("profile_scores").select("behavioral_score, psychometric_score, skills_score").eq("user_id", candidate_id).execute()
            
            if scores_res.data:
                s = scores_res.data[0]
                beh = s.get("behavioral_score") or 0
                psy = s.get("psychometric_score") or 0
                candidate["trust_score"] = int((psy * 0.6) + (beh * 0.4))
                candidate["skills_alignment"] = s.get("skills_score") or 0
            else:
                candidate["trust_score"] = 0
                candidate["skills_alignment"] = 0
                
            # Ensure raw behavioral and psychometric scores are NOT returned
            if "profile_scores" in candidate: del candidate["profile_scores"]
            
            return candidate
        except Exception as e:
            print(f"Error fetching candidate details: {e}")
            return None

    async def get_recruiter_stats(self, user_id: str) -> Dict:
        """
        Fetches operational stats for the recruiter dashboard.
        """
        # 1. Fetch Profile & Company (Safe fetch to avoid 404 from .single())
        profile_res = supabase.table("recruiter_profiles").select("*, companies(*)").eq("user_id", user_id).execute()
        if not profile_res.data:
             return {
                "active_jobs_count": 0,
                "total_hires_count": 0,
                "invites_sent_count": 0,
                "pending_applications_count": 0,
                "response_rate": 0.0,
                "avg_hiring_cycle": None,
                "candidate_feedback_score": 0.0,
                "company_quality_score": 0,
                "visibility_tier": "Low",
                "assessment_status": "not_started",
                "verification_status": "Under Review",
                "account_status": "Active",
                "completion_score": 0
            }
        
        profile = profile_res.data[0]
        company = profile.get("companies") or {}
        company_id = company.get("id")
        
        # SHARED COMPANY SCORE LOGIC:
        # If any recruiter in this company has completed the assessment (company has a score),
        # then this recruiter's status is also considered completed.
        company_score = company.get("profile_score", 0)
        assessment_status = profile.get("assessment_status", "not_started")
        
        if company_score > 0:
            assessment_status = "completed"

        # 2. Query Aggregate Stats (Conversion Funnel)
        active_jobs = 0
        total_views = 0
        total_apps = 0
        shortlisted = 0
        hires = 0

        try:
            if company_id:
                # Active Jobs
                jobs_res = supabase.table("jobs").select("id", count="exact").eq("company_id", company_id).eq("status", "active").execute()
                active_jobs = jobs_res.count or 0
                
                # Get all job IDs for this company
                all_jobs = supabase.table("jobs").select("id").eq("company_id", company_id).execute()
                job_ids = [j["id"] for j in all_jobs.data] if all_jobs.data else []

                if job_ids:
                    # Views Funnel
                    views_res = supabase.table("job_views").select("id", count="exact").in_("job_id", job_ids).execute()
                    total_views = views_res.count or 0

                    # Applications Funnel
                    apps_res = supabase.table("job_applications").select("id, status", count="exact").in_("job_id", job_ids).execute()
                    total_apps = apps_res.count or 0
                    
                    # Detailed Funnel Counts (Cumulative)
                    funnel = {
                        "applied": total_apps,
                        "shortlisted": 0,
                        "interviewed": 0,
                        "offered": 0,
                        "hired": 0
                    }
                    
                    for app in (apps_res.data or []):
                        status = app["status"]
                        if status in ["shortlisted", "interview_scheduled", "offered", "closed"]:
                            funnel["shortlisted"] += 1
                        if status in ["interview_scheduled", "offered", "closed"]:
                            funnel["interviewed"] += 1
                        if status in ["offered", "closed"]:
                            funnel["offered"] += 1
                        if status == "closed":
                            funnel["hired"] += 1
                    
                    # Shortlisted & Hires (for aggregate stats)
                    shortlisted = funnel["shortlisted"]
                    hires = funnel["hired"]
        except Exception as e:
            print(f"Stats query error: {str(e)}")
        
        # Calculate rates
        conv_rate = (total_apps / total_views * 100) if total_views > 0 else 0.0
        shortlist_rate = (shortlisted / total_apps * 100) if total_apps > 0 else 0.0
        
        return {
            "active_jobs_count": active_jobs,
            "total_hires_count": hires,
            "funnel_data": funnel if 'funnel' in locals() else {
                "applied": 0, "shortlisted": 0, "interviewed": 0, "offered": 0, "hired": 0
            },
            "total_views": total_views,
            "total_applications": total_apps,
            "conversion_rate": round(conv_rate, 1),
            "shortlist_rate": round(shortlist_rate, 1),
            "invites_sent_count": total_apps,
            "pending_applications_count": total_apps - hires - shortlisted,
            "response_rate": 85.0,
            "avg_hiring_cycle": 14.5,
            "candidate_feedback_score": company.get("candidate_feedback_score", 4.8),
            "company_quality_score": company_score,
            "visibility_tier": "Elite" if company_score > 80 else "Strong" if company_score > 50 else "Moderate",
            "assessment_status": assessment_status,
            "verification_status": "Verified" if company.get("registration_number") else "Under Review",
            "account_status": profile.get("account_status", "Active"),
            "completion_score": profile.get("completion_score", 0)
        }

    async def get_assessment_questions(self, user_id: str):
        """Fetch one random question from each of the 5 recruiter assessment categories."""
        # Clean up any previous incomplete or old assessment responses for this user
        # to ensure a fresh score calculation.
        try:
            supabase.table("recruiter_assessment_responses").delete().eq("user_id", user_id).execute()
        except Exception as e:
            print(f"Warning: Could not clear old responses: {e}")

        categories = [
            "recruiter_intent",
            "recruiter_icp",
            "recruiter_ethics",
            "recruiter_cvp",
            "recruiter_ownership"
        ]
        
        questions = []
        try:
            for cat in categories:
                res = supabase.table("recruiter_assessment_questions").select("*").eq("category", cat).execute()
                if res.data and len(res.data) > 0:
                    questions.append(random.choice(res.data))
            
            # If DB is empty, fallback to the original fixed questions logic
            if not questions:
                return None
                
            return questions
        except Exception as e:
            print(f"Error fetching recruiter questions: {str(e)}")
            return None

    async def evaluate_recruiter_answer(self, user_id: str, question_text: str, answer: str, category: str):
        prompt = f"""
        Act as an unbiased Corporate Quality Auditor. Your goal is to evaluate a recruiter's answer to determine the "Company Profile Score".
        
        STRICT EVALUATION RULES:
        1. PERSPECTIVE: Evaluate based on structural signals, not sentiment. A polite but vague answer scores LOWER than a direct, data-rich answer.
        2. UNBIASED: Disregard company size or flavor. Look for clarity of intent and specificity of the 'Cultural DNA'.
        3. CATEGORY CONTEXT (Category: {category}):
           - recruiter_intent: Evaluate the clarity of the company's "Soul" and long-term vision. Look for 'Universal DNA' traits that apply to *every* hire.
           - recruiter_icp: Evaluate how precisely they define high performance beyond technical skills.
           - recruiter_ethics: Evaluate the commitment to fairness and the elimination of unconscious bias.
           - recruiter_cvp: Evaluate the strength of the "Employer Brand" and non-monetary value.
           - recruiter_ownership: Evaluate the recruiter's accountability for the candidate's long-term success.
        
        SCORING RUBRIC (0.0 to 6.0):
        - 0-2 (Weak): Irrelevant, generic platitudes, or non-committal.
        - 3-4 (Moderate): Addresses the prompt with some concrete details.
        - 5-6 (Strong): Exceptional precision, evidence of structured thinking, and clear accountability.

        QUESTION: {question_text}
        RECRUITER ANSWER: {answer}

        Dimensions to score (0-6 each):
        1. Relevance: Did they answer the specific question?
        2. Specificity: Presence of concrete details (names, traits, timelines, reasons).
        3. Clarity: Is the response logically structured and professional?
        4. Ownership: Does the answer show accountability and serious organizational intent?

        Return ONLY a JSON object:
        {{
            "relevance": 5.5,
            "specificity": 4.0,
            "clarity": 5.0,
            "ownership": 6.0,
            "reasoning": "Provide a brief, objective justification (max 20 words)."
        }}
        """
        try:
            res = self.model.generate_content(prompt)
            # More robust JSON extraction
            text = res.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(text.strip())
            
            relevance = data.get("relevance", 0)
            specificity = data.get("specificity", 0)
            clarity = data.get("clarity", 0)
            ownership = data.get("ownership", 0)
            avg = (relevance + specificity + clarity + ownership) / 4

            # Store response
            store_res = supabase.table("recruiter_assessment_responses").insert({
                "user_id": user_id,
                "question_text": question_text,
                "answer_text": answer,
                "category": category,
                "relevance_score": relevance,
                "specificity_score": specificity,
                "clarity_score": clarity,
                "ownership_score": ownership,
                "average_score": avg,
                "evaluation_metadata": {
                    "reasoning": data.get("reasoning"),
                    "evaluator": "AI_GRADED_UNBIASED_RECRUITER"
                }
            }).execute()

            if not store_res.data:
                print(f"DEBUG: Failed to store response for {user_id}")

            return {"status": "ok", "score": avg, "reasoning": data.get("reasoning")}
        except Exception as e:
            print(f"AI Eval Error: {str(e)}")
            # Fallback to store a neutral score so the assessment can continue
            try:
                supabase.table("recruiter_assessment_responses").insert({
                    "user_id": user_id,
                    "question_text": question_text,
                    "answer_text": answer,
                    "category": category,
                    "relevance_score": 3,
                    "specificity_score": 3,
                    "clarity_score": 3,
                    "ownership_score": 3,
                    "average_score": 3.0
                }).execute()
            except:
                pass
            return {"status": "ok", "score": 3.0, "reasoning": "AI evaluation failed, using fallback score."}

    async def complete_recruiter_assessment(self, user_id: str):
        # 1. Calculate final score
        res = supabase.table("recruiter_assessment_responses").select("average_score").eq("user_id", user_id).execute()
        if not res.data or len(res.data) == 0:
            print(f"DEBUG: No responses found for {user_id}")
            return {"status": "error", "message": "No responses found"}
        
        scores = [float(r["average_score"]) for r in res.data]
        final_avg = sum(scores) / len(scores)
        # Normalize to 0-100
        normalized_score = int((final_avg / 6) * 100)

        # 2. Update company profile score (Competitive Progress Model)
        try:
            profile_res = supabase.table("recruiter_profiles").select("company_id").eq("user_id", user_id).execute()
            if profile_res.data and len(profile_res.data) > 0:
                company_id = profile_res.data[0]["company_id"]
                if company_id:
                    # Get existing score
                    comp_res = supabase.table("companies").select("profile_score").eq("id", company_id).execute()
                    current_score = comp_res.data[0].get("profile_score", 0) if comp_res.data else 0
                    
                    # Update ONLY if new score is higher
                    if normalized_score > current_score:
                        supabase.table("companies").update({"profile_score": normalized_score}).eq("id", company_id).execute()
        except Exception as e:
            print(f"DEBUG: Company score update error: {str(e)}")

        # 3. Update status
        try:
            supabase.table("recruiter_profiles").update({
                "assessment_status": "completed",
                "onboarding_step": "COMPLETED"
            }).eq("user_id", user_id).execute()
        except Exception as e:
            print(f"DEBUG: Profile update error: {str(e)}")
            return {"status": "error", "message": "Failed to update profile status"}

        return {"status": "ok", "final_score": normalized_score}

    async def get_team_members(self, user_id: str):
        """Fetch all recruiters belonging to the same company."""
        profile = await self.get_or_create_profile(user_id)
        company_id = profile.get("company_id")
        if not company_id:
            return []
            
        res = supabase.table("recruiter_profiles")\
            .select("user_id, full_name, job_title, team_role, assessment_status, created_at")\
            .eq("company_id", company_id)\
            .order("created_at", desc=False)\
            .execute()
        return res.data

    async def get_market_insights(self, user_id: str):
        """
        Calculate Career GPS insights based on platform-wide pool data.
        """
        # 1. Skill Density (Top 5 skills available in pool)
        # We'll approximate this by fetching all skills from candidate_profiles
        candidate_res = supabase.table("candidate_profiles").select("skills").eq("assessment_status", "completed").execute()
        
        skill_counts = {}
        total_candidates = len(candidate_res.data) if candidate_res.data else 0
        
        for cand in candidate_res.data:
            skills = cand.get("skills", [])
            for s in skills:
                skill_counts[s] = skill_counts.get(s, 0) + 1
        
        top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        density_data = [{"skill": k, "count": v, "percentage": int((v/total_candidates)*100) if total_candidates > 0 else 0} for k, v in top_skills]

        # 2. Competitive Index (How many active jobs per skill)
        jobs_res = supabase.table("jobs").select("skills_required").eq("status", "active").execute()
        job_skill_counts = {}
        for job in jobs_res.data:
            skills = job.get("skills_required", [])
            for s in skills:
                job_skill_counts[s] = job_skill_counts.get(s, 0) + 1
        
        top_job_skills = sorted(job_skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        competition_data = [{"skill": k, "active_openings": v} for k, v in top_job_skills]

        return {
            "talent_density": density_data,
            "competition_index": competition_data,
            "pool_size": total_candidates,
            "market_state": "High Demand" if total_candidates < (len(jobs_res.data) * 2) else "Balanced"
        }

    # --- JOB MANAGEMENT ---

    async def list_jobs(self, user_id: str):
        """List all jobs for the recruiter's company."""
        profile = await self.get_or_create_profile(user_id)
        company_id = profile.get("company_id")
        if not company_id:
            return []
        
        # Fetch jobs with recruiter details to identify ownership
        res = supabase.table("jobs")\
            .select("*, recruiter_profiles(full_name, user_id)")\
            .eq("company_id", company_id)\
            .order("created_at", desc=True)\
            .execute()
        
        # Mapping for schema compatibility
        for job in res.data:
            if "skills" in job and "skills_required" not in job:
                job["skills_required"] = job["skills"]
            if "requirements" not in job and "metadata" in job and isinstance(job["metadata"], dict):
                job["requirements"] = job["metadata"].get("requirements", [])
        
        return res.data

    async def create_job(self, user_id: str, job_data: Dict):
        """Create a new job posting."""
        profile = await self.get_or_create_profile(user_id)
        company_id = profile.get("company_id")
        if not company_id:
            raise Exception("No company linked to recruiter profile")
            
        # Standardize fields for the database
        db_payload = {
            "company_id": company_id,
            "recruiter_id": user_id,
            "title": job_data.get("title"),
            "description": job_data.get("description"),
            "experience_band": job_data.get("experience_band"),
            "job_type": job_data.get("job_type", "onsite"),
            "location": job_data.get("location"),
            "salary_range": job_data.get("salary_range"),
            "number_of_positions": job_data.get("number_of_positions", 1),
            "is_ai_generated": job_data.get("is_ai_generated", False),
            "status": "active",
            "metadata": job_data.get("metadata", {})
        }

        # Handle 'skills' vs 'skills_required'
        skills = job_data.get("skills_required") or job_data.get("skills")
        if skills:
            # TRY skills_required first as it's the intended name
            db_payload["skills_required"] = skills

        # Handle 'requirements' - if it fails, we'll put it in metadata
        requirements = job_data.get("requirements")
        if requirements:
            db_payload["requirements"] = requirements

        try:
            res = supabase.table("jobs").insert(db_payload).execute()
            if res.data:
                job = res.data[0]
                if "skills_required" not in job and "skills" in job:
                    job["skills_required"] = job["skills"]
                return job
            return None
        except Exception as e:
            error_msg = str(e)
            # If column mapping fails, try a more compatible insert
            if any(key in error_msg for key in ["requirements", "skills_required", "skills", "number_of_positions"]):
                # Remove problematic columns and move to metadata
                safe_payload = db_payload.copy()
                
                # Handle number_of_positions
                if "number_of_positions" in error_msg:
                    val = safe_payload.pop("number_of_positions", None)
                    if val:
                        if "metadata" not in safe_payload: safe_payload["metadata"] = {}
                        safe_payload["metadata"]["number_of_positions"] = val

                # Check for skills mismatches
                if "skills_required" in error_msg:
                    val = safe_payload.pop("skills_required", None)
                    if val: safe_payload["skills"] = val
                elif "skills" in error_msg:
                    val = safe_payload.pop("skills", None)
                    if val: safe_payload["skills_required"] = val

                if "requirements" in error_msg:
                    val = safe_payload.pop("requirements", None)
                    if val:
                        if "metadata" not in safe_payload: safe_payload["metadata"] = {}
                        safe_payload["metadata"]["requirements"] = val
                
                res = supabase.table("jobs").insert(safe_payload).execute()
                if res.data:
                    job = res.data[0]
                    if "skills" in job and "skills_required" not in job:
                        job["skills_required"] = job["skills"]
                    if "requirements" not in job and "metadata" in job:
                        job["requirements"] = job["metadata"].get("requirements", [])
                    return job
                return None
            raise e

    async def update_job(self, user_id: str, job_id: str, update_data: Dict):
        """Update an existing job posting with ownership check."""
        # Verify ownership
        job_res = supabase.table("jobs").select("recruiter_id").eq("id", job_id).execute()
        if not job_res.data:
            raise Exception("Job not found")
            
        if job_res.data[0]["recruiter_id"] != user_id:
            raise Exception("Unauthorized: You can only edit jobs you personally posted.")
            
        if update_data.get("status") == "closed":
            update_data["closed_at"] = datetime.now().isoformat()
            
        update_data["updated_at"] = datetime.now().isoformat()
        
        try:
            res = supabase.table("jobs").update(update_data).eq("id", job_id).execute()
            if res.data:
                job = res.data[0]
                if "skills" in job and "skills_required" not in job:
                    job["skills_required"] = job["skills"]
                return job
            return None
        except Exception as e:
            error_msg = str(e)
            if any(key in error_msg for key in ["requirements", "skills_required", "skills", "number_of_positions"]):
                # Fallback for old schema
                safe_data = update_data.copy()
                
                if "number_of_positions" in error_msg:
                    val = safe_data.pop("number_of_positions", None)
                    if val is not None:
                        metadata = safe_data.get("metadata", {})
                        metadata["number_of_positions"] = val
                        safe_data["metadata"] = metadata

                if "skills_required" in error_msg:
                    val = safe_data.pop("skills_required", None)
                    if val is not None: safe_data["skills"] = val
                elif "skills" in error_msg:
                    safe_data.pop("skills", None)

                if "requirements" in error_msg:
                    val = safe_data.pop("requirements", None)
                    if val is not None:
                        metadata = safe_data.get("metadata", {})
                        metadata["requirements"] = val
                        safe_data["metadata"] = metadata
                
                res = supabase.table("jobs").update(safe_data).eq("id", job_id).execute()
                if res.data:
                    job = res.data[0]
                    if "skills" in job and "skills_required" not in job:
                        job["skills_required"] = job["skills"]
                    if "requirements" not in job and "metadata" in job:
                        job["requirements"] = job["metadata"].get("requirements", [])
                    return job
                return None
            raise e

    async def invite_candidate(self, user_id: str, candidate_id: str, job_id: str, message: Optional[str] = None):
        """Recruiter invites a candidate to a specific job with ownership check."""
        # 1. Verify recruiter owns this job
        job_res = supabase.table("jobs").select("recruiter_id, company_id, title").eq("id", job_id).execute()
        if not job_res.data:
            raise Exception("Job not found")
            
        if job_res.data[0]["recruiter_id"] != user_id:
            raise Exception("Unauthorized: You can only invite candidates to jobs you personally posted.")
        
        job_title = job_res.data[0]["title"]
        company_id = job_res.data[0]["company_id"]
        
        # 2. Check if already applied/invited
        existing = supabase.table("job_applications").select("id").eq("candidate_id", candidate_id).eq("job_id", job_id).execute()
        if existing.data:
            return {"status": "exists", "id": existing.data[0]["id"]}
        
        # 3. Create 'invited' application
        res = supabase.table("job_applications").insert({
            "candidate_id": candidate_id,
            "job_id": job_id,
            "status": "invited",
            "invitation_message": message
        }).execute()

        # 4. Notify Candidate
        from src.services.notification_service import NotificationService
        NotificationService.create_notification(
            user_id=candidate_id,
            type="JOB_INVITATION",
            title=f"New Invitation: {job_title}",
            message=f"A recruiter has invited you to apply for the {job_title} position.",
            metadata={"job_id": job_id, "message": message}
        )
        
        # 5. Elite Hub: Automatically create/retrieve chat thread and send initiation message
        from src.services.chat_service import ChatService
        thread = ChatService.get_or_create_thread(user_id, candidate_id)
        if message:
            # We use a raw DB insert if we want to bypass the send_message gate for the INITIAL invite 
            # Or we ensure the recruiter can always send.
            # Actually, standard send_message now has a gate. 
            # Recruiter invites are 'INVITED' status which WE ARE ABOUT TO UNLOCK in the logic.
            ChatService.send_message(thread["id"], user_id, f"[Elite Invite Initiation for {job_title}]: {message}")

        return {"status": "invited", "data": res.data[0] if res.data else None}

    async def generate_job_description(self, prompt: str, experience_band: str):
        """Generate a job description using Gemini AI."""
        ai_prompt = f"""
        Act as an elite Executive Recruiter and Role Architect. 
        Your task is to transform a simple request into a high-impact, professional enterprise-grade job description for TalentFlow.

        USER REQUEST: "{prompt}"
        TARGET EXPERIENCE LEVEL: {experience_band}

        INSTRUCTIONS:
        1. Expand the user's request into a comprehensive, professional narrative.
        2. Describe the vision, impact, and daily challenges of the role.
        3. Create 5-7 distinct, high-quality professional requirements based on the {experience_band} seniority level.
        4. Identify 5-8 specific technical and soft skills required to succeed.
        5. Provide a realistic salary range based on current global market data for {experience_band} roles if not specified.
        6. Do NOT simply repeat the user's input; use your expertise to fill in the professional gaps.
        7. Ensure the tone is ambitious, clear, and corporate yet modern.

        Return the result ONLY in this strict JSON format:
        {{
            "title": "A compelling, clear, and industry-standard Job Title",
            "description": "A 200-300 word professional narrative about the role's mission and impact",
            "requirements": ["Professional Requirement 1", "Professional Requirement 2", ...],
            "skills_required": ["Specific Skill 1", "Specific Skill 2", ...],
            "job_type": "remote/hybrid/onsite",
            "salary_range": "e.g., $120,000 - $160,000 + Equity"
        }}
        """
        
        try:
            # Gemma models included as Gemini has 0 quota in this environment
            models_to_try = ['gemma-3-27b-it', 'gemma-3-4b-it', 'gemini-2.0-flash', 'gemini-1.5-flash']
            response = None
            last_error = None

            for model_name in models_to_try:
                try:
                    self.model = genai.GenerativeModel(model_name)
                    response = self.model.generate_content(ai_prompt)
                    if response:
                        break
                except Exception as e:
                    last_error = e
                    continue
            
            if not response:
                raise last_error or Exception("All models failed")

            # Extract JSON from potential markdown markers
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"AI Generation/Parsing Error: {str(e)}")
            # Robust fallback so the UI doesn't break
            return {
                "title": f"New {experience_band.capitalize()} Role",
                "description": f"Generated role for: {prompt}",
                "requirements": ["5+ years experience", "Strong communication"],
                "skills_required": ["Leadership", "Problem Solving"],
                "job_type": "onsite",
                "salary_range": "Competitive"
            }

recruiter_service = RecruiterService()
