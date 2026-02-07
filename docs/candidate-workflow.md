Purpose

Defines the end-to-end candidate journey from landing page to dashboard unlock.
This workflow is strict, gated, chat-based, and assessment-driven.

Candidate Workflow (Phase-1)
1. Entry & Authentication (Chat + Mic)

Landing page shows:

Signup
Login
Reset password

Signup flow:

Candidate selects Candidate role
Enters personal email only
Name auto-captured from email for greeting
OTP verification
Strong password creation
Redirected to login

Login:
Email + password
JWT issued

2. Profile Initialization (Mandatory, Sequential)

The following steps must be completed in order.
User cannot skip ahead.

Step 1: Experience Band Selection

Required options:

Fresher (0–1)
Mid-level (1–5)
Senior (5–10)
Leadership (10+)

Stored in candidate_profiles.experience_band

Step 2: Resume Upload

Allowed formats: PDF / DOC / DOCX
Resume stored in Supabase Storage
Resume metadata written to DB
Resume parsing (backend):

Extract:
role frequency
career gaps
achievements count
location
skills
Parsed insights stored (structured only)

Step 3: Skill Completion

System shows:
Skills extracted from resume
Candidate can:
Add missing skills manually (up to 8)
Final skill set = resume + manual skills

3. Assessment Awareness (Mandatory Disclosure)

Before starting assessment, candidate sees:
One-time assessment
Mixed question types
No copy/paste
No tab switching
Skip allowed (score impact)
Can Start Now or Take Later
Dashboard remains locked until completion

4. Assessment Execution (One Continuous Session)

Session created only on “Start Assessment”

Question count depends on experience band:

Fresher: max 8
Mid: max 10
Senior: max 13
Leadership: max 16

Question types:
Resume-based (conditional)
Behavioral
Psychometric
Skills
Reference (minimal for freshers)

Real-time validation (no ML):
answered?
min length?
keywords?
on topic?
logical flow?
Anti-cheat:
Copy-paste disabled
1 tab switch → warning
2 tab switches → permanent block

5. Post-Assessment Aadhaar Upload (Phase-1)

Aadhaar file upload only
No verification
Stored securely
Not visible to recruiters
Mandatory to unlock dashboard

6. Dashboard Unlock

Unlocked only if:
Assessment completed
Aadhaar uploaded

7. Candidate Dashboard Access

Candidate can now access:
Profile score & feedback
Job recommendations
Company recommendations
Career GPS
Applications & tracking
Posts
Controlled chat
Notifications
Account settings