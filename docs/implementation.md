# TalentFlow Implementation Documentation

## 1. Project Overview

TalentFlow is a high-trust recruitment platform designed to verify candidate signals through AI-powered assessments and structured onboarding. It features distinct workflows for Candidates and Recruiters, each gated by mandatory assessments that generate "Trust Scores."

## 2. Technology Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS 4.0
- **Database**: Supabase (PostgreSQL)
- **Intelligence Layer (LLM Ensemble)**:
  - **Google Gemini 1.5 Flash**: Qualitative assessment scoring and dynamic question generation.
  - **Groq (Llama 3.3 70B)**: Real-time high-throughput resume parsing.
- **Document Generation**: `xhtml2pdf` + `Jinja2` for dynamic resume generation.
- **Authentication**: Supabase Auth (JWT-based)
- **Voice**: Web Speech API for voice-to-text input
- **Realtime**: Supabase Realtime (PostgreSQL Replication) for Messaging.
- **Local Development**: Explicit `127.0.0.1:8000` binding for API resilience on Windows environments.

## 3. Core Logic & Architecture

### 3.1 Authentication & The Security Handshake

- **Role Binding**: Users are assigned a role (`candidate` or `recruiter`) during signup. This is stored in the `public.users` table.
- **The Login Handshake**: To prevent redirection loops and orphaned records, the frontend calls `/auth/post-login` immediately after any login or signup.
- **Auto-Recovery**: If a user exists in Supabase Auth but is missing records in `public.users` or their respective profile table, the backend automatically initializes them based on their email domain type.
- **Onboarding Redirection**: The backend returns a specific `next_step` (e.g., `/onboarding/candidate` or `/dashboard/recruiter`), which the frontend follows blindly.

### 3.2 Candidate Implementation

#### A. Onboarding Flow (Conversational AI - 6 Steps)

1. **Experience Selection**: Candidates select an `experience_band` (Fresher, Mid, Senior, Leadership).
2. **Resume Intelligence (The Dual Path)**:
   - **Smart Upload**: Resumes are uploaded to Supabase Storage. The backend parses them using an LLM ensemble to extract roles, experience, and skills.
   - **Interactive Builder**: For users without a resume, a guided chatbot collects details (Bio, Education, Timeline).
3. **Skill Enrichment**: AI-driven confirmation of technical and soft skills (SaaS, Lead Gen, etc.).
4. **Identity Verification**: Candidates must provide Aadhaar or Passport for KYC.
5. **Terms & Conditions**: Final legal agreement to platform rules and data privacy.
6. **Onboarding Completion**: Marks profile as `COMPLETED`.

- **Strict Gating Logic**: Dashboards are locked behind a "Verification Gate" until the user has:
  1.  Completed the Assessment.
  2.  Verified Identity (Aadhaar).
  3.  Accepted Terms.
- **Persistence**: The flow uses `onboarding_step` to track progress. If a user exits mid-flow, they return to the exact step where they left.
- **Data Integrity**: Profile fields like `experience_band` and core skills are **LOCKED** after assessment completion to prevent manipulation of matching results.

#### B. Assessment Engine (AI-Driven)

- **Seniority-Based Budgets**: Total questions scale with experience (8 to 16).
- **Weighted Category Distribution**: Questions are balanced across Resume AI Deep Dive, Skill Case Studies, Behavioral, and Psychometric based on seniority.
- **0–6 Scoring**: Every answer is evaluated by Gemini based on Relevance, Specificity, Clarity, and Ownership.
- **Normalization**: Computed using `(Raw_Average / 6) * 100` and stored in a persistent `profile_scores` table.

#### C. Dashboard (Candidate View)

- **UI Architecture**: Standardized layout utilizing the shared `CandidateSidebar`.
- **High-Trust Job Board**: Implements a strict **5 applications per day** limit to enforce quality over quantity and prevent spam.
- **Application Tracking**: A functional lifecycle state machine (`applied` → `invited` → `shortlisted` → `interview_scheduled` → `offered`).
- **Performance Monitoring**: Candidates see their aggregate score and a detailed progress breakdown (Skill Progress, Identity, and Completion status).

#### D. Workflows: Take Later & Retakes

- **"Take Later"**: Allows candidates to skip the assessment during onboarding to browse the dashboard. Access remains restricted for high-value features.
- **Assessment Retakes**: Candidates can retake the assessment via settings.
- **Best Score Logic**: Implements `max(new_score, old_score)` logic.
- **Performance Reset**: Triggers a global reset of assessment data and **unlocks** experience bands for editing, allowing for genuine career updates.

### 3.3 Controlled Chat (Messaging Architecture)

- **Status**: **IMPLEMENTED**
- **Elite Constraint**: Only recruiters can initiate a chat, and only after a candidate has been shortlisted or if a specific invite is sent with a personal message.
- **No Cold Messaging**: Candidates cannot send messages to recruiters unless a thread has been opened by the recruiter.
- **Supabase Realtime**: Fully operational. Uses PostgreSQL replication to push messages instantly.
- **History Persistence**: Single-thread logic ensures a single source of truth between pairs.

### 3.4 Notifications (Event-Driven)

- **Status**: **IMPLEMENTED**
- **Hub**: All system alerts (Assessment updates, Profile views, Chat invites) are aggregated in the `notifications` table.
- **Realtime Sync**: Integrated with the top-bar "Notification Hub" drawer.

### 3.5 Account Settings (Managed Identity)

- **Status**: **IMPLEMENTED**
- **Profile vs Account**:
  - **Profile**: Public-facing professional presence (Skills, Bio, Experience).
  - **Settings**: Private account management (Email, Password, Security, Data export).
- **Navigation**: Integrated into the unified sidebar for both roles.

### 3.6 Recruiter Implementation

#### A. Company Onboarding & Sync

- **Validation**: Recruiters must provide a valid Company Registration Number (CIN or GSTIN) validated via Regex.
- **Auto-Bio Generation**:
  - The system scrapes the company website provided by the recruiter.
  - **Intelligence**: Gemini 1.5 Flash extracts a concise mission statement/bio from raw HTML.

#### B. Recruitment Pipelines (Category A vs. B)

- **The Dual Strategy**:
  - **Pipeline A (Applied)**: Candidates grouped by job. Implements an automatic `is_skill_match` flag (≥40% skill alignment) to surfaces top talent within high-volume applications.
  - **Pipeline B (Recommended)**: Proactive talent discovery utilizing the `Culture Fit` score (70% Psychometric / 30% Behavioral weighting).
- **Global Pool**: A searchable index of all 100% verified identities on the platform.

#### C. Lifecycle Guardrails (The Golden Process)

To ensure process integrity, the system implements **Lifecycle Guardrails** at the database level:

1.  **State Machine Enforcement**: A PostgreSQL trigger `check_status_transition` prevents invalid jumps (e.g., Shortlisted -> Offered skipping Interview).
2.  **Audit Trail**: Every status change is logged in `job_application_status_history` with the recruiter's UUID and a timestamp.
3.  **Chat Restrictions**: The `ChatService.check_chat_permission` method enforces that a thread is only "active" if the candidate status is `shortlisted` or higher.
4.  **Bulk Workflow**: Recruiters can multi-select candidates in Pipeline A for bulk actions (Shortlist/Reject), significantly reducing manual overhead.

#### D. Virtual Interview Integration

- **Infrastructure**: Integration with Jitsi Meet (Open Source).
- **Logic**: When an interview is scheduled, a secure room link is generated: `https://meet.jit.si/TalentFlow-<application_id>`.
- **Automation**: Meeting links are automatically injected into both recruiter and candidate dashboards upon confirmation of the proposal.
- **Time Management**: All scheduling is done in **UTC** at the API layer, with frontend conversion to local timezone to prevent scheduling conflicts across regions.
  - **Confirmation Flow**: Users must approve the generated bio before it is persisted, maintaining a "Human-in-the-loop" pattern.
- **Teammate Hook**: Multiple recruiters can link to the same `company_id`.
- **Inheritance Logic**:
  - If a recruiter's company already has a **Company Profile Score (CPS)** from a colleague, the recruiter can **Skip & Use Existing** score to gain instant dashboard access.
  - Alternatively, they can choose to **Take Assessment & Improve**.

#### B. Recruiter Assessment (Company DNA Auditor)

- **Structure**: Exactly **5 questions** randomly selected from a bank of **125 validated prompts** (25 per category: Strategy, ICP, Ethics, CVP, Ownership).
- **The AI Auditor**: Uses Gemini 1.5 Flash to evaluate structural signals (Evidence-based answers vs. generic statements).
- **Scoring Logic**: $0$-$6$ scale per dimension. The total sum is normalized to a **0-100 Company Profile Score**.
- **Competitive Progress**: The company's public CPS is decided by $MAX(new\_score, existing\_score)$, ensuring institutional reputation only moves upwards.

#### C. Talent Marketplace (Recruiter View)

- **UI Architecture**: Standardized layout utilizing the shared `RecruiterSidebar`.
- **Navigation Flow**: Dashboard -> Post a Job -> My Jobs -> Candidate Pool -> Candidate Search -> Feed -> Profile -> Settings.
- **Verified Trust Matrix**: To protect raw candidate data, recruiters see a consolidated **Trust Score**:
  $$Trust Score = (Psychometric \times 0.6) + (Behavioral \times 0.4)$$
- **Visibility Gating**: Recruiters can only discover candidates with a `completed` assessment status.
- **Verification Hub**: Compact sidebar integration that facilitates the transition from "Locked" to "Active" states.
- **Dashboard UI**: Features a premium "Score Ring" visualizing the company's current trust standing.

### 3.4 Security & Anti-Cheat

- **Tab Switching (Anti-Cheat)**: Monitored via `visibilitychange`.
  - **1st Violation**: Warning.
  - **2nd Violation**: **The Nuclear Ban**. Immediate session termination, entry into `blocked_users` table, and permanent account lockout.
- **Copy-Paste Defense**: Frontend event listeners disable `onPaste` and `onContextMenu`.
- **Time Boxing**:
  - **Standard Questions**: **60 seconds** limit.
  - **Skill Case Studies**: **90-120 seconds** limit.
  - **Result**: Timeout leads to a 0.0 grade for that response.

## 4. Database Schema Summary

- `users`: Base identity and role tracking.
- `candidate_profiles` / `recruiter_profiles`: Role-specific metadata and onboarding progress.
- `companies`: Entity for recruiter association and profile scoring.
- `recruiter_assessment_questions`: Dedicated 125-question bank for recruiter DNA audits.
- `assessment_sessions`: Tracks live candidate assessment state.
- `assessment_responses`: Stores candidate AI-generated scores.
- `recruiter_assessment_responses`: Stores recruiter AI-generated scores.
- `profile_scores`: Persistent storage for highest achieved categorical and final scores.
- `blocked_users`: Security log for banned users (Nuclear Ban).
- `notifications`: Centralized event-driven alert system.
- `chat_threads`: 1-to-1 elite messaging channels.
- `chat_messages`: Audited real-time message logs.

### 3.7 Interview & Process Scheduling

- **Status**: **IMPLEMENTED**
- **The "Propose" Workflow**: Recruiters do not "assign" times. They propose 1-5 available slots (UTC), and the candidate must confirm one.
- **Trust-First Design**:
  - **Transparency**: Interviewer names are mandatory to build candidate trust.
  - **Audit Trail**: Cancellations require a reason and are logged in the process history.
- **Auto-Meeting Links**: Integrated with **Jitsi Meet**. The system generates a secure, unique meeting room link upon candidate confirmation.
- **Lifecycle Integration**: Automatically transitions application status from `Shortlisted` to `Interview Scheduled` upon confirmation.
- **Feedback Loop**: After an interview, recruiters are required to provide structured feedback to either mark as `Complete` (Next Round/Offer) or `Rejected`.

### 3.8 Recruiter "Do It Later" Locking System

- **Status**: **IMPLEMENTED**
- **The Friction Logic**: Recruiters can skip the DNA assessment during onboarding to browse the dashboard.
- **Hard Locks**: High-impact transmissions are locked until a `profile_score > 0` is achieved.
- **Restricted Features**:
  - **Talent Search (Career GPS)**: Market insights are hidden behind a `LockedView`.
  - **Job Management**: Recruiters cannot post or manage live jobs.
  - **Candidate Intelligence**: Full profile details and "Elite Pool" access are restricted.
  - **Messaging**: The communication channel remains dormant.
- **Unlocking**: Requires completion of the 5-question Cultural DNA assessment.

### 3.9 Advanced Hiring Funnel (Cumulative Analytics)

- **Status**: **IMPLEMENTED**
- **Logic**: Unlike independent counters, the funnel tracks **successful transitions** through the recruitment lifecycle.
- **Funnel Stages**: `Applied` → `Shortlisted` → `Interviewed` → `Hired`.
- **Pass-through Rates**: The system calculates the conversion efficiency from initial interest to final hire.
- **UI Architecture**: Visualized via the `HiringFunnel` component with real-time "Optimal/Sub-optimal" health indicators.

## 5. Scoring Math

- **Raw Dimension Score**: 0 to 6 (AI Generated).
- **Question Average**: Avg(Relevance, Specificity, Clarity, Ownership).
- **Normalization**: `(Average_Score / 6) * 100`.

## 6. Implementation Timeline (Current Progress)

- [x] Backend & Frontend Scaffold
- [x] Candidate Onboarding Chat
- [x] Recruiter Onboarding Chat
- [x] AI Resume Parsing & Skill Extraction
- [x] **Interactive Resume Builder & PDF Generation**
- [x] **Security Handshake (Session Recovery & Auto-Initialization)**
- [x] Security (Tab Switching & 2-Strike Ban)
- [x] Scoring Engine Implementation
- [x] Weighted Question Distribution (Seniority Scaling)
- [x] Retake Logic with "Best Score" Persistence
- [x] Aadhaar Verification persistence across retakes
- [x] "Take Later" / Dashboard Gating
- [x] Premium Dashboard UI for both roles
- [x] Feature 5: Controlled Chat (Architecture/DB/Impl)
- [x] Feature 6: Notifications Hub (Architecture/Impl)
- [x] Feature 7: Interview & Process Scheduling
- [x] **Feature 9: Pipeline A (Applied Candidates View)**
- [x] **Feature 10: Bulk Actions & Ethical Rejection Feedback**
- [x] **Feature 11: Lifecycle Guardrails & Audit Trail**
- [x] **Feature 12: Context-Aware Chat Restrictions**
- [x] Feature 8: Integrated Account Settings (Personal vs Profile)
- [x] API Connection Stability (127.0.0.1 alignment)
- [x] Feature 13: Recruiter "Do It Later" Gating & Hard Locks
- [x] Feature 14: Cumulative Hiring Funnel Analytics
- [x] Feature 3: Career GPS & Market Insights (UI Standardized)
- [x] Branding Enhancements (Lifestyle Photos & Employer DNA)
- [x] Automated Jitsi Video URIs
- [x] TypeScript & Linting Build Fixes (100% Type Safe)
- [ ] Feature 15: Matching Algorithm Refinement (Next)
- [ ] Feature 16: Automated Candidate Screening AI (Planned)

```
taskkill /F /IM node.exe /T; taskkill /F /IM python.exe /T; taskkill /F /IM uvicorn.exe /T; Remove-Item -Path "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue; Get-ChildItem -Path . -Filter "__pycache__" -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
```
