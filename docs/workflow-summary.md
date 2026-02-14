# TalentFlow Workflow Summary

## Candidate Journey

1. **Signup/Login**: Role selection (`candidate`), personal email only.
2. **Experience Selection**: Selection of band (Fresher to Leadership).
3. **Resume Intelligence**: Upload PDF; AI extracts skills, roles, and achievements.
4. **Skill Confirmation**: Finalize skills for assessment targeting.
5. **AI Assessment**: Dynamic questioning (resume-specific + behavioral). 60s/question.
6. **Scoring**: Generation of "Aggregate Talent Score" (0–100).
7. **Dashboard**: Access unlocked only after assessment; shows verified matches and profile strength.
8. **Elite Messaging**: Receive real-time invites from recruiters; unified notification hub for rapid responses.

## Recruiter Journey

1. **Signup/Login**: Role selection (`recruiter`), professional email only.
2. **Company Registration**: Mandatory CIN/GSTIN entry (Regex-validated).
3. **Profile Creation**: Company name, website, and description.
4. **Recruiter Assessment**: 5 AI-evaluated questions on intent and ethics.
5. **Company Scoring**: Generation of "Company Profile Score."
6. **Dashboard & Outreach**: Locked until assessment completion; elite 1-to-1 messaging with shortlisted candidates.

## Real-time Sync & Engagement

- **Notification Hub**: Real-time alerts for assessment completions, job status changes, and new messages.
- **Elite Chat**: Dedicated professional channels where recruiters initiate high-trust conversations.
- **Supabase Realtime**: Instant synchronization across all dashboard components.

- **Anti-Cheat**: 2-strike tab-switching rule leads to a permanent ban (`blocked_users`).
- **Input Control**: Copy-paste disabled during assessment.
- **Time Boxing**: 60-second limit per question to ensure authentic responses.

## UI Architecture (Matrix Design)

- Both workflows feature a persistent **Verification Hub** in the sidebar to track mandatory steps.
- **Recruiter**: Professional Blue layout.
- **Candidate**: Talent-focused Indigo layout.
- **Unified Navigation**: Common labels (Dashboard, Feed, Profile) for cross-role familiarity.

Recruiter:

- Signup → Company details → Assessment → Dashboard

Dashboard access is blocked until assessment completion.
