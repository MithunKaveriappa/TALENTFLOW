from typing import Dict, Any, List
from src.core.supabase import supabase
import google.generativeai as genai
from src.core.config import GOOGLE_API_KEY, OPENROUTER_API_KEY
import json
import httpx
from google.api_core import exceptions as google_exceptions

class CareerGPSService:
    @staticmethod
    def get_prompt(profile: Dict[str, Any], candidate_info: Dict[str, Any]) -> str:
        """Constructs the specialized Tech Sales prompt for Gemini."""
        skills = ", ".join(profile.get("skills", []))
        experience = profile.get("experience", "fresher")
        target_role = candidate_info.get("target_role", "SaaS Sales Leader")
        
        # Ensure interests is a string for the prompt
        interests = candidate_info.get("career_interests", "Enterprise Tech Sales")
        if isinstance(interests, list):
            interests = ", ".join(interests)
            
        long_term_goal = candidate_info.get("long_term_goal", "Become a VP of Sales in a Fortune 500 company")
        
        return f"""
        You are an elite Career Architect specialized ONLY in IT Tech Sales (SaaS, Cloud, Cybersecurity, AI Infrastructure).
        Your mission: Generate a step-by-step 'Career GPS' for an aspiring professional.
        
        CANDIDATE INPUTS:
        - target_role: {target_role}
        - experience_level: {experience}
        - current_skills: {skills}
        - career_vertical_interest: {interests} (Focus on: SaaS, Cybersecurity, Cloud, or Fintech based on this)
        - long_term_vision: {long_term_goal}
        
        TECH SALES SPECIALIZATION KNOWLEDGE:
        - Methodology: Deeply integrated MEDDPICC, Challenger Sale, and Value-Based Selling.
        - Tech Verticals: AWS/Azure/GCP Cloud Selling, SOC II/Compliance Cybersecurity, AI/LLM Infrastructure.
        - Career Ladder: SDR -> BDR -> Mid-Market AE -> Enterprise AE -> Sales Manager -> VP of Sales.
        - Alternative Paths: Solutions Engineer (SE) for technical profiles, or CSM for relationship-focused profiles.
        
        YOUR TASK:
        Return a valid JSON object representing a 4-6 milestone roadmap.
        Each milestone MUST include specialized 'Learning Actions' from Salesforce Trailhead and HubSpot Academy.
        
        JSON SCHEMA:
        {{
          "target_role": "string",
          "milestones": [
            {{
              "step_order": 1,
              "title": "Role Name (e.g. Enterprise Account Executive)",
              "description": "Succinct 1-sentence strategic focus for this role.",
              "skills_to_acquire": ["e.g. Multi-threaded Stakeholder Management", "Advanced MEDDPICC"],
              "learning_actions": [
                {{
                  "title": "Specific Course/Badge Title (e.g. Salesforce: Lead Management Basics)",
                  "platform": "Salesforce Trailhead | HubSpot Academy",
                  "url": "https://trailhead.salesforce.com/ or https://academy.hubspot.com/"
                }}
              ]
            }}
          ]
        }}
        
        CRITICAL RULES:
        1. NO generic advice. Use industry-standard Tech Sales terminology.
        2. Steps must be logical (e.g., Don't go from SDR to VP in 1 step).
        3. Prioritize 'Salesforce Trailhead' for Enterprise/Ops and 'HubSpot Academy' for Inbound/Prospecting.
        4. Output ONLY JSON.
        """

    @staticmethod
    async def generate_gps(user_id: str, candidate_info: Dict[str, Any]):
        """Generates and persists the career GPS path using an AI Router (OpenAI/OpenRouter -> Gemini)."""
        # 1. Fetch current profile
        profile_res = supabase.table("candidate_profiles").select("*").eq("user_id", user_id).execute()
        if not profile_res.data:
            raise Exception("Profile not found")
        
        profile = profile_res.data[0]
        
        # 2. Update profile with new GPS inputs
        # Convert comma-separated string to list if necessary
        interests = candidate_info.get("career_interests", "")
        interests_list = [i.strip() for i in interests.split(",")] if isinstance(interests, str) else interests

        supabase.table("candidate_profiles").update({
            "target_role": candidate_info["target_role"],
            "career_interests": interests_list,
            "long_term_goal": candidate_info["long_term_goal"]
        }).eq("user_id", user_id).execute()
        
        prompt = CareerGPSService.get_prompt(profile, candidate_info)
        gps_data = None
        generation_source = "Gemini"

        # 3. AI Router Execution (OpenRouter/OpenAI Priority)
        # We use OpenRouter as a primary router because it can access OpenAI (gpt-4o-mini), 
        # Claude (3.5-haiku), or Llama (3.1/3.3-70b) consistently.
        if OPENROUTER_API_KEY and len(OPENROUTER_API_KEY) > 10:
            try:
                print(f"DEBUG: Attempting GPS Generation via OpenRouter (OpenAI Router)...")
                async with httpx.AsyncClient(timeout=45.0) as client:
                    response = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://talentflow.ai", # Optional for OpenRouter
                            "X-Title": "TalentFlow"
                        },
                        json={
                            "model": "openai/gpt-4o-mini", # Optimized OpenAI model for logic-heavy JSON
                            "messages": [
                                {"role": "system", "content": "You are an elite Career Architect for IT Tech Sales. Always output valid JSON only."},
                                {"role": "user", "content": prompt}
                            ],
                            "response_format": {"type": "json_object"}
                        }
                    )
                    
                    if response.status_code == 200:
                        res_json = response.json()
                        content = res_json['choices'][0]['message']['content']
                        gps_data = json.loads(content)
                        generation_source = "OpenRouter (OpenAI-Powered)"
                    else:
                        print(f"DEBUG: OpenRouter failed ({response.status_code}): {response.text}")
            except Exception as e:
                print(f"DEBUG: OpenRouter Route Trace Error: {str(e)}")

        # 4. Fallback to Gemini if Router failed or was unavailable
        if not gps_data:
            if not GOOGLE_API_KEY:
                raise Exception("Neither OpenRouter nor Gemini API keys are configured.")
                
            try:
                print(f"DEBUG: Falling back to Gemini for GPS generation...")
                genai.configure(api_key=GOOGLE_API_KEY)
                model = genai.GenerativeModel('gemini-3-flash-preview')
                
                response = model.generate_content(prompt)
                cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
                gps_data = json.loads(cleaned_text)
                generation_source = "Gemini"
                
            except google_exceptions.ResourceExhausted:
                raise Exception("QUOTA_EXCEEDED: AI daily limit reached on both Router and Gemini. Try again tomorrow.")
            except Exception as e:
                print(f"GPS Gemini Fallback Error: {str(e)}")
                raise Exception(f"Failed to generate GPS. All AI routes failed.")

        # 5. Persist to Database (Same as before)
        try:
            # Create the GPS parent entry (upsert)
            existing_gps = supabase.table("career_gps").select("id").eq("candidate_id", user_id).execute()
            
            if existing_gps.data:
                gps_id = existing_gps.data[0]["id"]
                supabase.table("career_gps").update({
                    "target_role": gps_data["target_role"],
                    "updated_at": "now()"
                }).eq("id", gps_id).execute()
                # Clear old milestones for a fresh path
                supabase.table("career_milestones").delete().eq("gps_id", gps_id).execute()
            else:
                gps_res = supabase.table("career_gps").insert({
                    "candidate_id": user_id,
                    "target_role": gps_data["target_role"]
                }).execute()
                gps_id = gps_res.data[0]["id"]
            
            # Insert new milestones
            milestones = []
            for ms in gps_data["milestones"]:
                milestones.append({
                    "gps_id": gps_id,
                    "step_order": ms["step_order"],
                    "title": ms["title"],
                    "description": ms["description"],
                    "skills_to_acquire": ms["skills_to_acquire"],
                    "learning_actions": ms["learning_actions"],
                    "status": "not-started"
                })
            
            supabase.table("career_milestones").insert(milestones).execute()
            
            return {
                "status": "success", 
                "gps_id": gps_id, 
                "data": gps_data,
                "source": generation_source
            }
        except Exception as e:
            print(f"Persistence Error: {str(e)}")
            raise Exception("GPS generated but failed to save to timeline.")
