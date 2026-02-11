# TalentFlow: AI-Driven Talent Acquisition

A sophisticated platform for high-assurance recruitment using OpenAI/Gemini for behavioral analysis and biometric/behavioral verification (Nuclear Ban).

## Project Structure

- `apps/api`: FastAPI backend (Python 3.11+)
- `apps/web`: Next.js 16 + Tailwind CSS 4 frontend
- `docs/`: Authoritative architectural and schema documentation
- `infra/`: Supabase and Redis configuration
- `packages/shared/`: Shared enums and markdown schema references

## Key Systems

### 1. High-Assurance Assessment

- **Nuclear Ban**: Real-time monitoring of tab switches and window activity.
- **Dynamic Driver Scoring**: Evaluates Resilience, Communication, Growth Potential, and Ownership.
- **Fairness Engine**: Participation-weighted scoring to ensure equitable evaluation across different experience bands.

### 2. Autonomous Onboarding

- Supabase handles authentication.
- FastAPI centralizes all logic for onboarding state and redirection.
- Dynamic profile builders for Candidates and Recruiters.

## Development Setup

### Backend (FastAPI)

```powershell
cd apps/api
../../.venv_311/Scripts/python.exe -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)

```powershell
cd apps/web
npm run dev
```

## Security Model

- **RLS**: Row-Level Security enabled on all tables in Supabase.
- **Path Guarding**: Backend-driven redirection based on `onboarding_step`.
- **Nuclear Ban**: Disqualification for assessment violations.

## Auth & Onboarding Rules

- Supabase handles authentication only.
- FastAPI decides onboarding progression.
- Frontend follows backend instructions.
- No frontend guessing of state.
- Assessment is one-attempt-only.
