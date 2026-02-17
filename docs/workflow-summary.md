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
3. **Profile Creation**: Company name, website, and AI-suggested description.
4. **Assessment Strategy**: Option to **Take Assessment Now** or **Do It Later**.
5. **Locking Mechanism**: High-impact tools (GPS, Jobs, Pool) are "Hard Locked" for "Do It Later" users.
6. **Company Scoring**: Completion of 5 questions generates a "Company Profile Score."
7. **Analytics Hub**: Access to the **Cumulative Hiring Funnel** and Market Intelligence.
8. **Automated Interviews**: Generation of secure Jitsi Meet links for scheduled syncs.

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
