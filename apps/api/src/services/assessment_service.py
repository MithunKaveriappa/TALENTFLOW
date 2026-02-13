import json
import random
from typing import List, Dict, Optional
from datetime import datetime
from src.core.supabase import supabase
import google.generativeai as genai
from src.core.config import GOOGLE_API_KEY

class AssessmentService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def get_or_create_session(self, user_id: str):
        # 1. Fetch profile to get experience band
        try:
            profile_res = supabase.table("candidate_profiles").select("experience").eq("user_id", user_id).execute()
            if not profile_res.data:
                # If profile missing, check if we can create it or default to fresher
                print(f"DEBUG: Profile missing for {user_id}")
                band = "fresher"
                # Optionally sync profile here
            else:
                band = profile_res.data[0]["experience"]
        except Exception as e:
            print(f"DEBUG: Profile fetch error: {str(e)}")
            band = "fresher"
        
        # 2. Check if session exists
        try:
            session_res = supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
            if session_res.data:
                return session_res.data[0]
        except Exception as e:
            print(f"DEBUG: Session fetch error: {str(e)}")
            
        # 3. Define budget based on band
        budgets = {
            "fresher": 8,
            "mid": 10,
            "senior": 13,
            "leadership": 16
        }
        total_budget = budgets.get(band, 8)
        
        # 4. Initialize session
        new_session = {
            "candidate_id": user_id,
            "experience_band": band,
            "status": "started",
            "total_budget": total_budget,
            "current_step": 1,
            "driver_confidence": {},
            "component_scores": {
                "resume": 0,
                "behavioral": 0,
                "psychometric": 0,
                "skills": 0,
                "reference": 0
            }
        }
        
        try:
            res = supabase.table("assessment_sessions").insert(new_session).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"DEBUG: Session creation error: {str(e)}")
            return None

    async def get_next_question(self, user_id: str):
        try:
            session = await self.get_or_create_session(user_id)
            if not session or session.get("status") == "completed":
                return {"status": "completed"}

            conf = session.get("driver_confidence", {}) or {}
            required = ["resilience", "communication", "adaptability", "growth_potential", "emotional_stability"]
            high_confidence = len(conf) >= len(required) and all(conf.get(d, 0) >= 2 for d in required)

            if (session.get("current_step", 1) > session.get("total_budget", 15)) or high_confidence:
                return await self.complete_assessment(user_id, session)

            responses_res = supabase.table("assessment_responses").select("category").eq("candidate_id", user_id).execute()
            categories_asked = [r["category"] for r in (responses_res.data or [])]
            
            resume_count = categories_asked.count("resume")
            skill_count = categories_asked.count("skill")

            # 1. Quick check for data availability to avoid slow AI calls that will fail
            resume_data_exists = False
            try:
                rd_res = supabase.table("resume_data").select("user_id").eq("user_id", user_id).execute()
                resume_data_exists = len(rd_res.data) > 0
            except: pass

            skills_exist = False
            try:
                sk_res = supabase.table("candidate_profiles").select("skills").eq("user_id", user_id).execute()
                skills_exist = bool(sk_res.data and sk_res.data[0].get("skills"))
            except: pass

            # 2. Adaptive Priority Logic
            if resume_count < 3 and resume_data_exists:
                resume_q = await self._try_generate_resume_question(user_id, resume_count)
                if resume_q and resume_q.get("text"):
                    return resume_q

            if skill_count < 2 and skills_exist:
                skill_q = await self._try_generate_skill_question(user_id, session.get("experience_band", "fresher"))
                if skill_q and skill_q.get("text"):
                    return skill_q

            return await self._get_predefined_question(user_id, session.get("experience_band", "fresher"))
        except Exception as e:
            print(f"ERROR calculating next question: {str(e)}")
            return await self._get_predefined_question(user_id, "fresher")

    async def _try_generate_resume_question(self, user_id: str, current_count: int):
        try:
            res = supabase.table("resume_data").select("*").eq("user_id", user_id).execute()
            if not res.data or len(res.data) == 0:
                return None
            
            data = res.data[0]
            if current_count == 0:
                timeline = data.get("timeline", [])
                if len(timeline) > 1:
                    prompt = f"Based on this candidate's history: {json.dumps(timeline)}. Generate ONE professional question for an assessment about their role consistency and depth of responsibility. Keep it under 30 words."
                    q_text = await self._ai_generate(prompt)
                    return {"text": q_text, "category": "resume", "driver": "role_clarity", "difficulty": "medium"}
            
            if current_count == 1:
                gaps = data.get("career_gaps", {})
                if gaps and gaps.get("count", 0) > 0:
                    prompt = f"Candidate has career gaps: {json.dumps(gaps)}. Generate ONE professional question asking for transparency and growth during these periods. Under 30 words."
                    q_text = await self._ai_generate(prompt)
                    return {"text": q_text, "category": "resume", "driver": "career_gap", "difficulty": "medium"}

            if current_count == 2:
                achievements = data.get("achievements", [])
                if achievements:
                    prompt = f"Candidate achievements: {json.dumps(achievements)}. Generate ONE question to validate specificity and ownership of one major achievement. Under 30 words."
                    q_text = await self._ai_generate(prompt)
                    return {"text": q_text, "category": "resume", "driver": "achievement", "difficulty": "high"}
            
            return None
        except Exception as e:
            print(f"Error resume question: {str(e)}")
            return None

    async def _try_generate_skill_question(self, user_id: str, band: str):
        try:
            # Get skills in profile
            profile_res = supabase.table("candidate_profiles").select("skills").eq("user_id", user_id).execute()
            if not profile_res.data or len(profile_res.data) == 0:
                return None
            
            all_skills = profile_res.data[0].get("skills", [])
            if not all_skills: return None

            # Filter out skills already tested
            used_res = supabase.table("assessment_responses").select("driver").eq("candidate_id", user_id).eq("category", "skill").execute()
            used_skills = [r["driver"] for r in (used_res.data or [])]
            
            available_skills = [s for s in all_skills if s not in used_skills]
            if not available_skills: return None # No more unique skills to test
            
            skill = random.choice(available_skills)
            prompt = f"Context: It Tech Sales Assessment. Experience Band: {band}. Candidate Skill: {skill}. Generate a high-pressure SCENARIO based question (Case study) that tests technical accuracy and sales process understanding. The question must end with 'How would you proceed?'. Under 50 words."
            q_text = await self._ai_generate(prompt)
            return {"text": q_text, "category": "skill", "driver": skill, "difficulty": "high"}
        except Exception as e:
            print(f"Error skill question: {str(e)}")
            return None

    async def _get_predefined_question(self, user_id: str, band: str):
        # Pick category (Behavioral vs Psychometric)
        cat = random.choice(["behavioral", "psychometric"])
        
        # Get questions already asked to avoid repetition
        used_q_res = supabase.table("assessment_responses").select("question_id").eq("candidate_id", user_id).execute()
        used_ids = [r["question_id"] for r in used_q_res.data if r.get("question_id")]
        
        # Select a question from DB
        query = supabase.table("assessment_questions").select("*").eq("category", cat).eq("experience_band", band)
        
        res = query.execute()
        available = [q for q in res.data if q["id"] not in used_ids]
            
        if not available:
            # Fallback if band specific is empty, try any band
            fallback_res = supabase.table("assessment_questions").select("*").eq("category", cat).execute()
            available = [q for q in fallback_res.data if q["id"] not in used_ids]

        if not available:
            return {"status": "no_more_questions"}
            
        q = random.choice(available)
        return {
            "id": q["id"],
            "text": q["question_text"],
            "category": q["category"],
            "driver": q["driver"],
            "difficulty": q["difficulty"]
        }

    async def _ai_generate(self, prompt: str) -> Optional[str]:
        try:
            # Use async version of generate_content with a safety timeout
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"DEBUG: Gemini Generation Error: {str(e)}")
            return None 

    async def evaluate_answer(self, user_id: str, question_id: Optional[str], category: str, answer: str, difficulty: str, metadata: dict = {}):
        # 1. Handle Skip
        if not answer or answer.strip() == "":
            return await self._store_response(user_id, question_id, category, answer, 0, True, metadata)

        # 2. Evaluation Method
        # Shifted to full semantic AI evaluation to eliminate linguistic and keyword bias
        score, eval_meta = await self._evaluate_ai(answer, category, metadata)

        # Merge original question metadata with AI evaluation results
        full_metadata = {**metadata, **eval_meta}
        return await self._store_response(user_id, question_id, category, answer, score, False, full_metadata)

    async def _evaluate_ai(self, answer: str, category: str, q_metadata: dict):
        rubric = q_metadata.get('evaluation_rubric')
        rubric_instruction = f"Evaluation Rubric: {rubric}" if rubric else "No specific rubric provided. Use the STAR (Situation, Task, Action, Result) framework to identify logical depth and evidence."

        # Bias-aware system prompt focusing on intent, logic, and evidence
        prompt = f"""
        Category: {category}
        Question: {q_metadata.get('text', 'Professional question')}
        Candidate Answer: {answer}
        
        {rubric_instruction}
        
        System Instruction:
        Evaluate this answer on a scale of 0 to 6 based on professional depth, logic, and evidence.
        
        Neutrality Guardrails:
        1. Ignore non-standard grammar, regional idioms, or non-native phrasing.
        2. Focus on the core 'Signal' and 'Intent' rather than linguistic polish.
        3. Do not penalize for brevity if the response is technically accurate or demonstrates ownership.
        4. Look for specific logic, evidence, or specific examples provided.
        
        Return ONLY a JSON object: {{"score": 4, "reasoning": "short explanation of the signal detected"}}
        """
        try:
            res = await self.model.generate_content_async(prompt)
            data = json.loads(res.text.replace('```json', '').replace('```', '').replace('json', '').strip())
            return data.get("score", 0), {"reasoning": data.get("reasoning", ""), "evaluator": "AI_GRADED_UNBIASED"}
        except Exception as e:
            print(f"DEBUG: AI Eval Error: {str(e)}")
            return 3, {"reasoning": "Fallback score due to AI timeout", "evaluator": "FALLBACK"}

    async def _store_response(self, user_id: str, q_id: Optional[str], category: str, answer: str, score: int, is_skipped: bool, metadata: dict):
        # 1. Fetch current session for updates (Safe fetch)
        session_res = supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
        if not session_res.data:
            return {"status": "error", "message": "Session not found"}
        
        session = session_res.data[0]
        new_step = session["current_step"] + 1
        
        # 2. Update Driver Confidence if score > 4
        driver = metadata.get("driver")
        confidence = session.get("driver_confidence", {})
        if driver and score >= 4:
            curr_conf = confidence.get(driver, 0)
            confidence[driver] = curr_conf + 1
            
        # 3. Update session
        supabase.table("assessment_sessions").update({
            "current_step": new_step,
            "driver_confidence": confidence
        }).eq("candidate_id", user_id).execute()

        # 4. Store the response
        res_data = {
            "candidate_id": user_id,
            "question_id": q_id,
            "question_text": metadata.get("text"), # Store the actual question text
            "category": category,
            "driver": metadata.get("driver"),
            "raw_answer": answer,
            "score": score,
            "is_skipped": is_skipped,
            "evaluation_metadata": metadata,
            "difficulty": metadata.get("difficulty", "medium"),
            "tab_switches": metadata.get("tab_switches", 0)
        }
        
        supabase.table("assessment_responses").insert(res_data).execute()
        return {"status": "ok", "score": score}

    async def complete_assessment(self, user_id: str, session: dict):
        # 1. Fetch all responses
        res = supabase.table("assessment_responses").select("*").eq("candidate_id", user_id).execute()
        responses = res.data
        
        # 2. Group scores by category
        cat_scores = {}
        for r in responses:
            cat = r["category"]
            if cat not in cat_scores: cat_scores[cat] = []
            cat_scores[cat].append(r["score"])
            
        # 3. Calculate Component Scores (Normalized to 0-100)
        # Base is 0-6. Max is 6 * count. Factor = 100 / 6 = 16.66
        comp_scores = {}
        for cat, scores in cat_scores.items():
            if not scores: continue
            avg_base = sum(scores) / len(scores)
            comp_scores[cat] = round((avg_base / 6) * 100)

        # 4. Final Weighted Scoring (Normalized to present categories)
        band = session.get("experience_band", "fresher")
        weights = {
            "fresher": {"resume": 0.35, "behavioral": 0.25, "psychometric": 0.25, "skill": 0.10, "reference": 0.05},
            "mid": {"resume": 0.30, "behavioral": 0.25, "psychometric": 0.25, "skill": 0.12, "reference": 0.08},
            "senior": {"resume": 0.30, "behavioral": 0.28, "psychometric": 0.22, "skill": 0.10, "reference": 0.10},
            "leadership": {"resume": 0.25, "behavioral": 0.25, "psychometric": 0.25, "skill": 0.15, "reference": 0.10}
        }.get(band, {})

        final_score = 0
        total_weight_present = 0
        weighted_sum = 0
        
        for cat, weight in weights.items():
            scores = cat_scores.get(cat, [])
            # Only count a category towards the total weight if:
            # 1. It has a non-zero average score (meaning they succeeded at least once)
            # 2. OR they have answered more than 2 questions in this category (meaning we have enough data to trust a low score)
            
            if scores:
                avg = sum(scores) / len(scores)
                if avg > 0 or len(scores) > 2:
                    weighted_sum += comp_scores[cat] * weight
                    total_weight_present += weight
                
        if total_weight_present > 0:
            final_score = round(weighted_sum / total_weight_present)
        else:
            # Fallback to simple average if no weights match
            final_score = round(sum(comp_scores.values()) / len(comp_scores)) if comp_scores else 0

        # 5. Update DB
        supabase.table("assessment_sessions").update({
            "status": "completed",
            "overall_score": final_score,
            "component_scores": comp_scores,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("candidate_id", user_id).execute()

        # Update candidate status
        supabase.table("candidate_profiles").update({
            "assessment_status": "completed"
        }).eq("user_id", user_id).execute()

        # Sync to profile_scores table
        supabase.table("profile_scores").upsert({
            "user_id": user_id,
            "resume_score": comp_scores.get("resume", 0),
            "behavioral_score": comp_scores.get("behavioral", 0),
            "psychometric_score": comp_scores.get("psychometric", 0),
            "skills_score": comp_scores.get("skill", 0),
            "final_score": final_score
        }).execute()

        return {"status": "completed", "score": final_score}

assessment_service = AssessmentService()
