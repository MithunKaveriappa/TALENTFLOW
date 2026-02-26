# TalentFlow: AI-Driven Talent Acquisition

A sophisticated platform for high-assurance recruitment using OpenAI/Gemini for behavioral analysis and biometric/behavioral verification (Nuclear Ban).

## Project Structure

- `apps/api`: FastAPI backend (Python 3.11+)
- `apps/web`: Next.js 16 + Tailwind CSS 4 frontend
- `docs/`: Authoritative architectural and schema documentation
- `infra/`: Supabase and Redis configuration
- `packages/shared/`: Shared enums and markdown schema references

## Key Systems

### 1. High-Assurance Assessment Engine

- **Adaptive Priority Pipeline**: Dynamically sequences questions based on candidate data (Resume -> Skills -> Seeded Behavioral Traits).
- **Strategic Recruiter Auditor**: Dynamic 125-question bank for recruiters evaluating Company DNA and Strategic Intent.
- **Competitive Progress Model**: Multi-recruiter score inheritance and performance benchmarking for organizational trust.
- **Unbiased Semantic Scoring**: Powered by Gemini 1.5 Flash, focusing on "Logic over Linguistics" to eliminate cultural and linguistic bias.
- **Nuclear Ban**: Integrity monitoring (tab switching) to ensure assessment validity.
- **Driver Evolution**: Comprehensive 810-question bank across Resilience, Communication, Adaptability, Growth Potential, and Sales DNA.

### 2. Strategic Intelligence & Document Logic

- **Smart Intent Parsing**: Extracts structured intent from resumes (Career Gaps, Skill Entropy, Role Clarity) using LLMs.
- **Interactive Builder**: Guided conversational flow for candidates without existing resumes.
- **Unified Trust Matrix**: Provides recruiters with high-signal, objective metrics bypassing traditional resume-level bias.

### 3. Autonomous Onboarding

- Supabase handles authentication.
- FastAPI centralizes all logic for onboarding state and redirection.
- **Security Handshake**: Automated recovery of interrupted profiles during login.
- Dynamic profile builders for Candidates and Recruiters.

## Development Setup

### Backend (FastAPI)

```powershell
# Navigate to the API app
cd apps/api

# Run uvicorn using the root virtual environment
../../.venv/Scripts/python.exe -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
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

## Git Update
- git status
- git add .
- git config --global user.email "you@example.com"
- git config --global user.name "Your Name"
- git commit -m "changes"
- git push origin main