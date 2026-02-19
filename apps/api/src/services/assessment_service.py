import json
import random
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from src.core.supabase import async_supabase as supabase # Switch to Async
from src.services.notification_service import NotificationService
import google.generativeai as genai
from src.core.config import GOOGLE_API_KEY

class AssessmentService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        # Upgraded to Gemini 3 Flash (Preview) for Elite Performance & Reliability
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    async def get_or_create_session(self, user_id: str):
        # 1. Fetch profile to get experience band
        try:
            profile_res = await supabase.table("candidate_profiles").select("experience").eq("user_id", user_id).execute()
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
            session_res = await supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
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
            res = await supabase.table("assessment_sessions").insert(new_session).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"DEBUG: Session creation error: {str(e)}")
            return None

    async def get_next_question(self, user_id: str):
        try:
            session = await self.get_or_create_session(user_id)
            if not session or session.get("status") == "completed":
                return {"status": "completed"}

            band = session.get("experience_band", "fresher")
            budget = session.get("total_budget", 8)
            current_step = session.get("current_step", 1)

            # 1. Termination Condition
            if current_step > budget:
                return await self.complete_assessment(user_id, session)

            # 2. Get current counts
            responses_res = await supabase.table("assessment_responses").select("category").eq("candidate_id", user_id).execute()
            counts = {
                "resume": 0,
                "skill": 0,
                "behavioral": 0,
                "psychometric": 0
            }
            for r in (responses_res.data or []):
                counts[r["category"]] = counts.get(r["category"], 0) + 1
            
            # 3. Calculate Targets (Weighted Model Feb 2026)
            targets = self._get_target_counts(band, budget)
            
            # 4. Data Availability Checks
            resume_data_exists = False
            try:
                rd_res = await supabase.table("resume_data").select("user_id").eq("user_id", user_id).execute()
                resume_data_exists = len(rd_res.data) > 0
            except: pass

            skills_exist = False
            try:
                sk_res = await supabase.table("candidate_profiles").select("skills").eq("user_id", user_id).execute()
                skills_exist = bool(sk_res.data and sk_res.data[0].get("skills"))
            except: pass

            # 5. Iterative Selection based on Weights & Priority
            # Priority: Resume -> Skills -> Behavioral -> Psychometric
            
            # Category: Resume
            if counts["resume"] < targets["resume"] and resume_data_exists:
                q = await self._try_generate_resume_question(user_id, counts["resume"])
                if q and q.get("text"): return q

            # Category: Skills
            if counts["skill"] < targets["skill"] and skills_exist:
                q = await self._try_generate_skill_question(user_id, band)
                if q and q.get("text"): return q

            # Category: Behavioral
            if counts["behavioral"] < targets["behavioral"]:
                return await self._get_predefined_question(user_id, band, "behavioral")

            # Category: Psychometric
            if counts["psychometric"] < targets["psychometric"]:
                return await self._get_predefined_question(user_id, band, "psychometric")

            # Fallback: If AI targets can't be met (missing data), fill with randomized seeded questions
            choice = random.choice(["behavioral", "psychometric"])
            return await self._get_predefined_question(user_id, band, choice)

        except Exception as e:
            print(f"ERROR calculating next question: {str(e)}")
            return await self._get_predefined_question(user_id, "fresher", "behavioral")

    def _get_target_counts(self, band: str, budget: int) -> Dict[str, int]:
        """Calculates category targets based on mandated weights."""
        weights = {
            "fresher": {"resume": 0.20, "behavioral": 0.35, "psychometric": 0.35, "skill": 0.10},
            "mid": {"resume": 0.20, "behavioral": 0.30, "psychometric": 0.30, "skill": 0.20},
            "senior": {"resume": 0.20, "behavioral": 0.25, "psychometric": 0.25, "skill": 0.30},
            "leadership": {"resume": 0.25, "behavioral": 0.20, "psychometric": 0.20, "skill": 0.35}
        }.get(band, {"resume": 0.20, "behavioral": 0.30, "psychometric": 0.30, "skill": 0.20})

        targets = {}
        for cat, weight in weights.items():
            targets[cat] = max(1, round(weight * budget))
            
        # Adjust for rounding errors to match exact budget
        curr_total = sum(targets.values())
        if curr_total != budget:
            diff = budget - curr_total
            # Add/Subtract from behavioral as it's a flexible middle category
            targets["behavioral"] = max(1, targets["behavioral"] + diff)
            
        return targets

    async def _try_generate_resume_question(self, user_id: str, current_count: int):
        try:
            res = await supabase.table("resume_data").select("*").eq("user_id", user_id).execute()
            if not res.data or len(res.data) == 0:
                return None
            
            data = res.data[0]
            # More variety in resume prompts based on index
            if current_count % 3 == 0:
                timeline = data.get("timeline", [])
                if len(timeline) > 1:
                    prompt = f"Candidate History: {json.dumps(timeline)}. Generate ONE professional question about role consistency or reasons for specific transitions. Under 30 words."
                    q_text = await self._ai_generate(prompt)
                    return {"text": q_text, "category": "resume", "driver": "role_clarity", "difficulty": "medium"}
            
            if current_count % 3 == 1:
                gaps = data.get("career_gaps", {})
                if gaps and gaps.get("count", 0) > 0:
                    prompt = f"Career Gaps: {json.dumps(gaps)}. Generate ONE question about productivity and growth during these periods. Under 30 words."
                    q_text = await self._ai_generate(prompt)
                    return {"text": q_text, "category": "resume", "driver": "career_gap", "difficulty": "medium"}

            achievements = data.get("achievements", [])
            if achievements:
                prompt = f"Achievements: {json.dumps(achievements)}. Generate ONE question to validate the SPECIFIC logic or ownership of one major milestone. Under 30 words."
                q_text = await self._ai_generate(prompt)
                return {"text": q_text, "category": "resume", "driver": "achievement", "difficulty": "high"}
            
            return None
        except Exception as e:
            print(f"Error resume question: {str(e)}")
            return None

    async def _try_generate_skill_question(self, user_id: str, band: str):
        try:
            profile_res = await supabase.table("candidate_profiles").select("skills").eq("user_id", user_id).execute()
            if not profile_res.data or len(profile_res.data) == 0:
                return None
            
            all_skills = profile_res.data[0].get("skills", [])
            if not all_skills: return None

            # Get skills already tested in this session
            used_res = await supabase.table("assessment_responses").select("driver").eq("candidate_id", user_id).eq("category", "skill").execute()
            used_skills = [r["driver"] for r in (used_res.data or [])]
            
            available_skills = [s for s in all_skills if s not in used_skills]
            # If all skills used, allow recycling or fallback to top 3
            if not available_skills:
                available_skills = all_skills
            
            skill = random.choice(available_skills)
            prompt = f"Expertise Level: {band}. Candidate Skill: {skill}. Generate a high-pressure Case Study question to test technical logic and sales execution for this skill. End with 'How would you proceed?'. Under 50 words."
            q_text = await self._ai_generate(prompt)
            return {"text": q_text, "category": "skill", "driver": skill, "difficulty": "high"}
        except Exception as e:
            print(f"Error skill question: {str(e)}")
            return None

    async def _get_predefined_question(self, user_id: str, band: str, category: str):
        # Pick category (Behavioral vs Psychometric)
        cat = category

        # Get question IDs already used by this user
        used_res = await supabase.table("assessment_responses").select("question_id").eq("candidate_id", user_id).execute()
        used_ids = [r["question_id"] for r in (used_res.data or []) if r.get("question_id")]

        # Query seeded questions
        query = supabase.table("assessment_questions") \
            .select("*") \
            .eq("category", cat) \
            .eq("experience_band", band)
        
        if used_ids:
            query = query.not_.in_("id", used_ids)
            
        res = await query.limit(20).execute()
        
        if not res.data:
            # Fallback to any band if current band is exhausted
            res = await supabase.table("assessment_questions") \
                .select("*") \
                .eq("category", cat) \
                .limit(1).execute()
        
        if not res.data:
            return {"text": f"Tell me about a time you handled a difficult challenge in {cat} context.", "category": cat, "driver": "generic", "difficulty": "medium"}

        q = random.choice(res.data)
        return {
            "id": q["id"],
            "text": q["question_text"],
            "category": q["category"],
            "driver": q["trait_driver"],
            "difficulty": q["difficulty_level"]
        }
        
        # Get questions already asked to avoid repetition
        used_q_res = await supabase.table("assessment_responses").select("question_id").eq("candidate_id", user_id).execute()
        used_ids = [r["question_id"] for r in used_q_res.data if r.get("question_id")]
        
        # Select a question from DB
        query = supabase.table("assessment_questions").select("*").eq("category", cat).eq("experience_band", band)
        
        res = await query.execute()
        available = [q for q in res.data if q["id"] not in used_ids]
            
        if not available:
            # Fallback if band specific is empty, try any band
            fallback_res = await supabase.table("assessment_questions").select("*").eq("category", cat).execute()
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
            # Add strict timeout to prevent "Failed to fetch" on frontend
            response = await asyncio.wait_for(self.model.generate_content_async(prompt), timeout=15.0)
            return response.text.strip()
        except asyncio.TimeoutError:
            print("DEBUG: AI Generation timed out.")
            return None
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

        # Elite AI Auditor Prompt Engineering (Feb 2026)
        prompt = f"""
        Act as a Lead Behavioral Psychologist and Senior GTM Strategy Consultant for TalentFlow.
        YOUR TASK: Conduct a rigorous, unbiased audit of a candidate's response to an IT Tech Sales assessment.

        CONTEXT:
        Category: {category}
        Question: {q_metadata.get('text', 'Professional question')}
        Candidate Answer: {answer}
        
        {rubric_instruction}
        
        EVALUATION FRAMEWORK (0-6 SCALE):
        - 6 (ELITE): Explicit evidence of STAR framework. Metrics-driven results. Deep strategic ownership.
        - 4 (SOLID): Clear logical path. Specific examples provided. Demonstrates core competency.
        - 2 (WEAK): Generic 'filler' content. No specific evidence. Passive language.
        - 0 (NONE): Non-responsive or logical failure.

        NEUTRALITY & BIAS GUARDRAILS:
        1. SIGNAL OVER SYNTAX: Ignore non-standard grammar, regional idioms, or non-native phrasing. Focus on 'Commercial Logic'.
        2. STAR GATE: If a candidate fails to mention a Result (even if the Action was good), cap the score at 3.
        3. EVIDENCE ONLY: Score ONLY on provided text. Do not infer professional background.
        
        Return ONLY a JSON object: {{"score": 4, "reasoning": "Succinct 1-sentence audit trail", "framework_used": "STAR-detected/General-Logic"}}
        """
        try:
            res = await asyncio.wait_for(self.model.generate_content_async(prompt), timeout=18.0)
            # Robust JSON cleaning
            text = res.text.strip().replace('```json', '').replace('```', '').replace('json', '').strip()
            data = json.loads(text)
            return data.get("score", 0), {
                "reasoning": data.get("reasoning", ""), 
                "framework": data.get("framework_used", "N/A"),
                "evaluator": "AI_AUDITOR_GEMINI_3"
            }
        except asyncio.TimeoutError:
            print("DEBUG: AI Evaluation timed out.")
            return 3, {"reasoning": "Fallback score due to AI timeout (18s exceeded)", "evaluator": "FALLBACK"}
        except Exception as e:
            print(f"DEBUG: AI Eval Error: {str(e)}")
            return 3, {"reasoning": "Fallback score due to unexpected error", "evaluator": "FALLBACK"}

    async def _store_response(self, user_id: str, q_id: Optional[str], category: str, answer: str, score: int, is_skipped: bool, metadata: dict):
        # 1. Fetch current session for updates (Safe fetch)
        session_res = await supabase.table("assessment_sessions").select("*").eq("candidate_id", user_id).execute()
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
        await supabase.table("assessment_sessions").update({
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
        
        await supabase.table("assessment_responses").insert(res_data).execute()
        return {"status": "ok", "score": score}

    async def complete_assessment(self, user_id: str, session: dict):
        # 1. Fetch all responses
        res = await supabase.table("assessment_responses").select("*").eq("candidate_id", user_id).execute()
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
        existing_res = await supabase.table("profile_scores").select("final_score").eq("user_id", user_id).execute()
        existing_score = existing_res.data[0].get("final_score", 0) if existing_res.data else 0

        # Best Score Logic: Only update profile_scores if new score is higher or equal
        should_update_profile = final_score >= existing_score
        
        display_score = final_score if should_update_profile else existing_score

        await supabase.table("assessment_sessions").update({
            "status": "completed",
            "overall_score": final_score,
            "component_scores": comp_scores,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("candidate_id", user_id).execute()

        # Update candidate status
        profile_update = {"assessment_status": "completed"}
        if should_update_profile or not existing_res.data:
            profile_update["final_profile_score"] = final_score

        await supabase.table("candidate_profiles").update(profile_update).eq("user_id", user_id).execute()

        if should_update_profile or not existing_res.data:
            # Sync to profile_scores table
            await supabase.table("profile_scores").upsert({
                "user_id": user_id,
                "resume_score": comp_scores.get("resume", 0),
                "behavioral_score": comp_scores.get("behavioral", 0),
                "psychometric_score": comp_scores.get("psychometric", 0),
                "skills_score": comp_scores.get("skill", 0),
                "final_score": final_score
            }).execute()

        NotificationService.create_notification(
            user_id=user_id,
            type="ASSESSMENT_COMPLETED",
            title="Assessment Finalized",
            message=f"Evaluation complete. Your high-trust score of {display_score}% has been logged to your secure profile.",
            metadata={"score": display_score}
        )

        return {"status": "completed", "score": display_score}

    async def retake_assessment(self, user_id: str):
        """Resets the assessment session but keeps the high score in profile_scores."""
        try:
            # 1. Delete the current session
            await supabase.table("assessment_sessions").delete().eq("candidate_id", user_id).execute()
            
            # 2. Clear responses for a fresh start
            await supabase.table("assessment_responses").delete().eq("candidate_id", user_id).execute()
            
            # 3. Reset profile status to allow retaking
            await supabase.table("candidate_profiles").update({
                "assessment_status": "started"
            }).eq("user_id", user_id).execute()
            
            # Note: We do NOT delete from profile_scores to allow comparison later
            
            return {"status": "ok", "message": "Assessment reset for retake. Previous high score preserved."}
        except Exception as e:
            print(f"Error resetting assessment: {str(e)}")
            return {"status": "error", "message": str(e)}

assessment_service = AssessmentService()
