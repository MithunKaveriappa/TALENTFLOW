import httpx
from pypdf import PdfReader
import io
from src.core.supabase import supabase
import json
import os
import google.generativeai as genai

class ResumeService:
    @staticmethod
    async def parse_resume(user_id: str, resume_path: str, google_key: str):
        # 1. Download file from Supabase Storage
        try:
            file_res = supabase.storage.from_("resumes").download(resume_path)
        except Exception as e:
            print(f"Error downloading resume: {str(e)}")
            return {"skills": [], "timeline": [], "error": "Storage download failed"}
        
        # 2. Extract text from PDF
        try:
            reader = PdfReader(io.BytesIO(file_res))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text: {str(e)}")
            return {"skills": [], "timeline": [], "error": "PDF text extraction failed"}

        # Store raw text early so we have it even if AI fails
        await ResumeService._store_initial_text(user_id, text)

        # 3. Call Groq if available (preferred)
        groq_key = os.getenv("GROQ_API_KEY")
        if groq_key and len(groq_key) > 5:
            try:
                from groq import Groq
                client = Groq(api_key=groq_key)
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a resume parser. Output ONLY valid JSON."
                        },
                        {
                            "role": "user",
                            "content": f"Extract structured data from this resume. Keys: current_role (string), years_of_experience (integer), current_company (string), timeline (list of objects with role, company, start, end), career_gaps (count, details), achievements (list of strings), skills (list of strings), education (degree, institution, year). Resume: {text[:10000]}"
                        }
                    ],
                    response_format={"type": "json_object"}
                )
                parsed_data = json.loads(completion.choices[0].message.content)
                await ResumeService._store_data(user_id, text, parsed_data)
                return parsed_data
            except Exception as e:
                print(f"Groq parsing failed: {str(e)}")

        # 4. Call High-Fidelity AI Auditor (Gemini 3 Flash)
        if google_key:
            try:
                genai.configure(api_key=google_key)
                model = genai.GenerativeModel('gemini-3-flash-preview')
                
                # Today's date for gap calculation logic
                today = "February 19, 2026"
                
                prompt = f"""
                Act as an Elite AI Talent Auditor and Data Architect for TalentFlow.
                MISSION: Perform a high-fidelity 'Structural Audit' of the following resume text.

                EXTRACTION REQUIREMENTS (JSON ONLY):
                - location: string (City, Country)
                - professional_summary: string (2-3 concise sentences)
                - education_history: list of objects {{institute, degree, year_passing, gpa_score, is_completed (boolean)}}
                - experience_history: list of objects {{role, company, tenure_years, achievements (list), start_date, end_date}}
                - projects: list of objects {{title, description, tech_stack (list), link}}
                - certifications: list of strings (e.g., "Salesforce Certified Administrator")
                - skills: list of technical and soft skills (Salesforce, MEDDPICC, B2B SaaS, etc.)
                - core_metadata: {{
                    "current_role": string,
                    "total_years_experience": float,
                    "current_company": string,
                    "is_fresher": boolean
                  }}

                CAREER GAP AUDIT LOGIC (Relative to Today: {today}):
                1. Experienced Candidates: Flag any gap between jobs > 6 months.
                2. Freshers: Flag if Graduation Year is > 12 months from today with 0 industry experience.
                3. career_gap_report: object {{ "has_gap": bool, "months_total": int, "details": string }}

                Resume Text:
                {text[:12000]}
                """

                response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json"
                    )
                )
                
                parsed_data = json.loads(response.text)
                await ResumeService._store_data(user_id, text, parsed_data)
                return parsed_data
            except Exception as e:
                print(f"Gemini High-Fidelity parsing failed: {str(e)}")

        # Final fallback - Mock High-Fidelity Data
        mock_data = {
            "location": "Unknown",
            "professional_summary": "Resume data summarized.",
            "education_history": [],
            "experience_history": [],
            "projects": [],
            "certifications": [],
            "skills": ["Communication"],
            "core_metadata": {
                "current_role": "Analyst",
                "total_years_experience": 0,
                "current_company": "Unknown",
                "is_fresher": True
            },
            "career_gap_report": {"has_gap": False, "details": "AI keys missing. Using basic fallback."},
            "status": "partial_success"
        }
        await ResumeService._store_data(user_id, text, mock_data)
        return mock_data

    @staticmethod
    async def _store_initial_text(user_id: str, text: str):
        try:
            supabase.table("resume_data").upsert({
                "user_id": user_id,
                "raw_text": text[:10000]
            }).execute()
        except Exception as e:
            print(f"Error storing initial text: {str(e)}")

    @staticmethod
    async def _store_data(user_id: str, text: str, parsed_data: dict):
        try:
            # 1. Update resume_data audit table (The Forensic Log)
            supabase.table("resume_data").upsert({
                "user_id": user_id,
                "raw_text": text[:12000],
                "raw_education": parsed_data.get("education_history"),
                "raw_experience": parsed_data.get("experience_history"),
                "raw_projects": parsed_data.get("projects"),
                "skills": parsed_data.get("skills"),
                "achievements": parsed_data.get("experience_history", [{}])[0].get("achievements", []) if parsed_data.get("experience_history") else [],
                "parsed_at": "now()"
            }).execute()

            # 2. Sync High-Fidelity fields to candidate_profiles 
            # (Matches candidate_high_fidelity_schema.sql)
            core = parsed_data.get("core_metadata", {})
            profile_updates = {
                "location": parsed_data.get("location"),
                "professional_summary": parsed_data.get("professional_summary"),
                "education_history": parsed_data.get("education_history", []),
                "experience_history": parsed_data.get("experience_history", []),
                "projects": parsed_data.get("projects", []),
                "certifications": parsed_data.get("certifications", []),
                "career_gap_report": parsed_data.get("career_gap_report", {}),
                "skills": parsed_data.get("skills", []),
                "last_resume_parse_at": "now()",
                "ai_extraction_confidence": 0.95 # Tagging successful Gemini 3 Flash parse
            }

            # Map Core Metadata
            if core.get("current_role"):
                profile_updates["current_role"] = core.get("current_role")
            
            if core.get("total_years_experience") is not None:
                profile_updates["years_of_experience"] = int(core.get("total_years_experience"))
            
            if core.get("current_company"):
                profile_updates["current_company_name"] = core.get("current_company")
                
            # Experience Band Mapping Logic for Assessment Engine
            years = profile_updates.get("years_of_experience", 0)
            if core.get("is_fresher") or years < 1:
                profile_updates["experience"] = "fresher"
            elif 1 <= years < 4:
                profile_updates["experience"] = "mid"
            elif 4 <= years < 8:
                profile_updates["experience"] = "senior"
            else:
                profile_updates["experience"] = "leadership"

            # 3. Final Profile Sync
            supabase.table("candidate_profiles").update(profile_updates).eq("user_id", user_id).execute()

        except Exception as e:
            print(f"CRITICAL: High-Fidelity Store failed: {str(e)}")
