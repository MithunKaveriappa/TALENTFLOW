## TalentFlow Auth & Onboarding

- Supabase handles authentication only
- FastAPI decides onboarding progression
- Frontend follows backend instructions
- No frontend guessing of state
- Assessment is one-attempt-only
-cd apps/api
../../.venv_311/Scripts/python.exe -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
