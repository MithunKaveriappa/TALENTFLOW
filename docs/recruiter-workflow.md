Purpose

Defines recruiter onboarding, assessment, and dashboard unlock logic.

Recruiter Workflow (Phase-1)

1. Entry & Authentication

Recruiter selects Recruiter role
Must use professional email only
Free email domains blocked
OTP verification
Password creation
Redirect to login

2. Company Onboarding Gate

After first login, recruiter is not sent to dashboard.

Recruiter must:

- **Identification**: Enter CIN/GSTIN (Validated via Regex).
- **Auto-Bio Suggestion**: Upon entering the company website, the system scrapes the site and generates a 2-3 sentence bio using Gemini AI.
- **Manual Verification**: Recruiter confirms, edits, or replaces the suggested bio and enters the location.

3. Recruiter Assessment (The Quality Gate)

4. Recruiter Assessment (The Quality Gate)

Exactly **5 questions** assessing the following dimensions:

1. Hiring Intent
2. Ethics & Fairness
3. Role Clarity
4. Candidate Value Proposition
5. Fit Definition

**Evaluation**:

- AI-Driven qualitative scoring (0-6 scale) using Gemini 1.5 Flash.
- **Security**: 2-strike tab-switching ban and 60-second response timers.

4. Company Profile Score Generation

- Total Dimension Sum is normalized to a **0-100 Company Quality Score**.
- This score determines the company's reputation and visibility to top-tier candidates.
- **Persistence**: Results are stored in `recruiter_assessment_responses` for auditing and scoring.

5. Dashboard Unlock & "Do It Later" Logic

- **Traditional Path**: Complete the 5-question assessment to unlock all features immediately.
- **"Do It Later" Path**: Recruiters can skip the assessment during onboarding to browse limited dashboard features.
- **Hard Locks**: High-impact sections like **Job Management**, **Career GPS**, and **Candidate Intelligence** are functionally locked until a `profile_score > 0` is achieved.
- **Trust Visualization**: The premium dashboard features a "Profile Signal Strength" tracker and a "Company Visibility" tier based on the score.

6. Hiring Funnel & Analytics

The recruiter dashboard now features a **Cumulative Hiring Funnel**:

- **Real-time Tracking**: Monitors total volume across `Applied` → `Shortlisted` → `Interviewed` → `Hired`.
- **Conversion Insights**: Provides pass-through percentages to help recruiters identify bottlenecks in their process.
- **Health Indicators**: Automatically flags funnel performance as "Optimal" or "Requires Attention."

7. Talent Discovery (Candidate Pool)

Once the dashboard is unlocked, recruiters gain access to the **TalentFlow Candidate Pool**:

- **Experience Targeting**: Candidates are automatically categorized into bands (Fresher, Mid, Senior, Leadership).
- **Verified Trust Signal**: Recruiters see a high-level **Trust Score (0-100)** which is an aggregate of behavioral and psychometric signals.
- **Privacy First**: Raw assessment answers and component scores are hidden from recruiters to prevent bias and protect candidate data integrity.
- **Real-time Sync**: The pool updates instantly as candidates complete assessments or update profiles.

7. Recruiter Dashboard Access (Matrix Unified Layout)

The recruiter workspace utilizes the Shared Sidebar (`RecruiterSidebar.tsx`) with professional blue accents, ensuring navigation consistency with the candidate experience.

**Core Navigation Hub:**

- **Dashboard**: High-level overview of active jobs, applicant volume, and company trust score.
- **Applied Pipeline**: Grouped view of reactive applicants for active jobs with "Skill Match" badges.
- **Recommended Talent**: Proactive AI-driven cultural matching (70% Psy / 30% Beh).
- **Candidate Pool**: Global search and sourcing hub for all verified platform users.
- **Post a Job**: Direct entry into the job creation flow with AI assistance.
- **My Jobs**: Management interface for active, closed, and drafted job listings.
- **Settings**: Configuration for company profile and recruiter preferences.

8. Structured Hiring Lifecycle & Guardrails

To maintain platform high-trust standards, all hiring follows a forced-path lifecycle:

1.  **Stage 1: Applied / Recommended**: Candidate enters the pool.
2.  **Stage 2: Shortlisted**: Recruiter flags interest. Chat opens automatically.
3.  **Stage 3: Interview Scheduled**: Secure Jitsi room is generated. Standardized UTC scheduling.
4.  **Stage 4: Offer / Reject**: Final decision. **Guardrail**: "Offer" is disabled unless Stage 3 (Interview) was logged.

**Infrastructure Support:**

- **Audit Logging**: Every status movement is recorded in the `job_application_status_history` table for transparency.
- **Bulk Workflow**: Efficient bulk shortlisting/rejection in the Applied Pipeline to handle high applicant volumes.
- **Personalized Invites**: Direct-from-pool invitations including specific job context and personalized messages for Category B talent.

**Verification Hub (Sidebar Widget):**
A real-time status tracker in the sidebar that ensures the recruiter maintains a high-quality profile and completes required identity or company verification steps.
