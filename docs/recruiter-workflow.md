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
Enter company registration number

If found → auto-populate details

Else → manually enter:
company name
website
location
description
Company entity created.

3. Recruiter Assessment (The Quality Gate)

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

6. Dashboard Unlock

Unlocked only if:
Recruiter assessment completed
Company assessment marked completed

7. Recruiter Dashboard Access

Recruiter can now:

Manage company profile
Post jobs
View applied & recommended candidates
Invite candidates
Shortlist / reject with feedback
Schedule interviews
Post engagement content
Use controlled chat
View notifications
Manage account settings
