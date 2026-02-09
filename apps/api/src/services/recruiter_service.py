import json
from typing import List, Dict, Optional
from datetime import datetime
from src.core.supabase import supabase
import google.generativeai as genai
from src.core.config import GOOGLE_API_KEY

class RecruiterService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def get_or_create_profile(self, user_id: str):
        res = supabase.table("recruiter_profiles").select("*, companies(*)").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
        
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
        
        if comp_res.data:
            company_id = comp_res.data[0]["id"]
        else:
            # Create a placeholder company
            new_comp = {
                "name": "Pending Verification",
                "registration_number": registration_number
            }
            ins_res = supabase.table("companies").insert(new_comp).execute()
            company_id = ins_res.data[0]["id"]

        # 2. Link recruiter to company and advance step
        supabase.table("recruiter_profiles").update({
            "company_id": company_id,
            "onboarding_step": "DETAILS"
        }).eq("user_id", user_id).execute()

        return {"status": "ok", "company_id": company_id}

    async def update_company_details(self, user_id: str, company_id: str, details: Dict):
        # Update company table
        supabase.table("companies").update({
            "name": details.get("name"),
            "website": details.get("website"),
            "location": details.get("location"),
            "description": details.get("description")
        }).eq("id", company_id).execute()

        # Advance recruiter step
        supabase.table("recruiter_profiles").update({
            "onboarding_step": "ASSESSMENT_PROMPT"
        }).eq("user_id", user_id).execute()

        return {"status": "ok"}

    async def evaluate_recruiter_answer(self, user_id: str, question_text: str, answer: str, category: str):
        prompt = f"""
        Category: {category}
        Question: {question_text}
        Recruiter Answer: {answer}

        Evaluate this answer on a scale of 0 to 6 based on 4 dimensions:
        1. Relevance (Does it answer the question?)
        2. Specificity (Concrete details vs vague talk)
        3. Clarity (Logical structure)
        4. Ownership (Direct accountability)

        Return ONLY a JSON object:
        {{
            "relevance": 5,
            "specificity": 4,
            "clarity": 5,
            "ownership": 6,
            "reasoning": "short explanation"
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
                "average_score": avg
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

        # 2. Update company profile score
        try:
            profile_res = supabase.table("recruiter_profiles").select("company_id").eq("user_id", user_id).execute()
            if profile_res.data and len(profile_res.data) > 0:
                company_id = profile_res.data[0]["company_id"]
                if company_id:
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

recruiter_service = RecruiterService()
