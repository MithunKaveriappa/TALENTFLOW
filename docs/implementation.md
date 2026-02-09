# TalentFlow Implementation Documentation

## 1. Project Overview

TalentFlow is a high-trust recruitment platform designed to verify candidate signals through AI-powered assessments and structured onboarding. It features distinct workflows for Candidates and Recruiters, each gated by mandatory assessments that generate "Trust Scores."

## 2. Technology Stack

- **Backend**: FastAPI (Python 3.9+)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini 1.5 Flash (via `google-generativeai` SDK)
- **Authentication**: Supabase Auth (JWT-based)
- **Voice**: Web Speech API for voice-to-text input

## 3. Core Logic & Architecture

### 3.1 Authentication & Role Management

- **Role Binding**: Users are assigned a role (`candidate` or `recruiter`) during signup. This is stored in the `public.users` table.
- **Email Gating**:
  - Candidates must use personal email domains.
  - Recruiters must use professional/corporate domains.
- **Initialization**: Upon first login, a profile is initialized in `candidate_profiles` or `recruiter_profiles`.

### 3.2 Candidate Implementation

#### A. Onboarding Flow

1. **Experience Selection**: Candidates select an `experience_band` (Fresher, Mid, Senior, Leadership).
2. **Resume Intelligence**:
   - Resumes are uploaded to Supabase Storage.
   - AI extracts roles, career gaps, achievements, and skills.
3. **Skill Verification**: Extracted skills are shown to the user for confirmation and manual addition.

#### B. Assessment Engine (AI-Driven)

- **Dynamic Questioning**: Questions are generated on-the-fly based on the resume (e.g., consistency, career gaps) and chosen from a predefined bank for behavioral/psychometric traits.
- **0–6 Scoring**: Every answer is evaluated by Gemini based on Relevance, Specificity, Clarity, and Ownership.
- **Scoring Weights**: Scores are aggregated into component scores (Resume, Behavioral, Psychometric, Skills, Reference) and normalized into an `overall_score` (0–100).

#### C. Dashboard

- Displays the "Aggregate Talent Score."
- High-trust UI with performance monitoring and job matches.

### 3.3 Recruiter Implementation

#### A. Company Onboarding

- **Validation**: Recruiter must provide a valid Company Registration Number (CIN or GSTIN) validated via Regex.
- **Profiling**: Basic company details (Name, Website, Location, Description) are captured.

#### B. Recruiter Assessment

- **Purpose**: To generate a "Company Profile Score" signaling trust and hiring intent.
- **Structure**: 5 mandatory questions covering:
  1. Hiring Intent & Role Clarity
  2. Ideal Candidate Profile (ICP) Understanding
  3. Ethics & Fair Hiring Practices
  4. Candidate Value Proposition
  5. Decision-Making & Ownership
- **Scoring**: Rule-based AI evaluation on a 0–6 scale across the same 4 dimensions as candidates.

#### C. Dashboard

- **Premium UI**: Matches the candidate aesthetic but focused on recruiter needs.
- **Gating**: Dashboard remains "Locked" until the assessment is completed.

### 3.4 Security & Anti-Cheat

- **Tab Switching**: Both candidate and recruiter assessments monitor `visibilitychange`.
  - **Strike 1**: Warning message displayed in chat.
  - **Strike 2**: User is permanently banned and stored in the `blocked_users` table.
- **Copy-Paste**: Disabled during assessment input via frontend handlers.
- **Session Continuity**: Assessments must be completed in one go with a 60-second timer per question (auto-timeout counts as a score of 0).

## 4. Database Schema Summary

- `users`: Base identity and role tracking.
- `candidate_profiles` / `recruiter_profiles`: Role-specific metadata and onboarding progress.
- `companies`: Entity for recruiter association and profile scoring.
- `assessment_sessions`: Tracks current progress and warning counts.
- `assessment_responses` / `recruiter_assessment_responses`: Stores raw answers and AI-generated dimension scores.
- `blocked_users`: Security log for banned users.

## 5. Scoring Math

- **Raw Dimension Score**: 0 to 6 (AI Generated).
- **Question Average**: Avg(Relevance, Specificity, Clarity, Ownership).
- **Normalization**: `(Average_Score / 6) * 100`.

## 6. Implementation Timeline (Current Progress)

- [x] Backend & Frontend Scaffold
- [x] Candidate Onboarding Chat
- [x] Recruiter Onboarding Chat
- [x] AI Resume Parsing & Skill Extraction
- [x] Security (Tab Switching & 2-Strike Ban)
- [x] Scoring Engine Implementation
- [x] Premium Dashboard UI for both roles
- [x] SQL Schema Gaps Filled
