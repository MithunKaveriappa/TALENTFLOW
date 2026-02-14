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

5. Dashboard Unlock

- Dashboard is **locked** (blurred/overlay) until the 5-question assessment is completed.
- The premium dashboard features a "Company Profile Score" ring displaying the AI-calculated trust level.

One continuous session

Questions assess:

hiring intent
ethics
clarity of roles
candidate value proposition
fit definition
Signal-based scoring
No raw answers stored

5. Company Profile Score Generation

Recruiter assessment completes
Company score calculated
Stored at company level
Shared across all recruiters of that company

6. Talent Discovery (Candidate Pool)

Once the dashboard is unlocked, recruiters gain access to the **TalentFlow Candidate Pool**:

- **Experience Targeting**: Candidates are automatically categorized into bands (Fresher, Mid, Senior, Leadership).
- **Verified Trust Signal**: Recruiters see a high-level **Trust Score (0-100)** which is an aggregate of behavioral and psychometric signals.
- **Privacy First**: Raw assessment answers and component scores are hidden from recruiters to prevent bias and protect candidate data integrity.
- **Real-time Sync**: The pool updates instantly as candidates complete assessments or update profiles.

7. Recruiter Dashboard Access (Matrix Unified Layout)

The recruiter workspace utilizes the Shared Sidebar (`RecruiterSidebar.tsx`) with professional blue accents, ensuring navigation consistency with the candidate experience.

**Core Navigation Hub:**
- **Dashboard**: High-level overview of active jobs, applicant volume, and company trust score.
- **Post a Job**: Direct entry into the job creation flow with AI assistance.
- **Jobs**: Management interface for active, closed, and drafted job listings.
- **Feed**: Talent engagement platform for company branding and ecosystem updates.
- **Candidates**: Access to the AI-curated talent pool and applicant management.
- **Settings**: Configuration for company profile and recruiter preferences.
- **Log Out**: Secure session termination.

**Verification Hub (Sidebar Widget):**
A real-time status tracker in the sidebar that ensures the recruiter maintains a high-quality profile and completes required identity or company verification steps.
