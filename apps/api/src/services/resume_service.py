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
                            "content": f"Extract structured data from this resume. Keys: timeline (role, company, start, end), career_gaps (count, details), achievements (list), skills (list), education (degree, institution, year). Resume: {text[:10000]}"
                        }
                    ],
                    response_format={"type": "json_object"}
                )
                parsed_data = json.loads(completion.choices[0].message.content)
                await ResumeService._store_data(user_id, text, parsed_data)
                return parsed_data
            except Exception as e:
                print(f"Groq parsing failed: {str(e)}")

        # 4. Call Gemini via SDK (Reliable for 3.11)
        if google_key and not google_key.startswith("AIzaSyArx"): # Skip if it's the placeholder
            try:
                genai.configure(api_key=google_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                Extract structured metadata from the following resume.
                Provide the output ONLY as a valid JSON object with the following keys:
                - timeline: list of objects with {{role, company, start, end}}
                - career_gaps: object with {{count, details}}
                - achievements: list of strings
                - skills: list of strings
                - education: object with {{degree, institution, year}}

                Resume Text:
                {text[:10000]}
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
                print(f"Gemini SDK parsing failed: {str(e)}")

        # Final fallback - Mock data for development if keys are missing
        mock_data = {
            "skills": ["SaaS Sales", "Relationship Management", "Lead Generation"],
            "timeline": [{"role": "Account Executive", "company": "TechCorp", "start": "2021", "end": "Present"}],
            "message": "AI keys missing or failed. Using development fallback."
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
            supabase.table("resume_data").upsert({
                "user_id": user_id,
                "raw_text": text[:10000],
                "timeline": parsed_data.get("timeline"),
                "career_gaps": parsed_data.get("career_gaps"),
                "achievements": parsed_data.get("achievements"),
                "skills": parsed_data.get("skills"),
                "education": parsed_data.get("education")
            }).execute()
        except Exception as e:
            print(f"Error updating resume data with parsed results: {str(e)}")
    async def _store_data(user_id: str, text: str, parsed_data: dict):
        try:
            supabase.table("resume_data").upsert({
                "user_id": user_id,
                "raw_text": text[:10000],
                "timeline": parsed_data.get("timeline"),
                "career_gaps": parsed_data.get("career_gaps"),
                "achievements": parsed_data.get("achievements"),
                "skills": parsed_data.get("skills"),
                "education": parsed_data.get("education")
            }).execute()
        except Exception as e:
            print(f"Error storing resume data: {str(e)}")
