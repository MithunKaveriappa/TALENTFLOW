Purpose

This document defines exact conditions under which dashboards unlock.
There are no soft rules—these are hard gates.

Candidate Dashboard Gates
A Candidate CAN access the dashboard if they have completed basic profile extraction.

### Mandatory Conditions

1. **Experience Band set** (`experience` field).
2. **Resume uploaded** (`resume_uploaded = true`).

### Feature Locking (Restricted Access)
If the assessment is not completed (`assessment_status != 'completed'`), the following features remain **LOCKED** in the dashboard:
- Full Trust Score Display (only shows "Pending Assessment").
- Job Matching Signal (Candidates cannot apply to jobs without a score).
- Verified Badge.
- Detailed Behavioral Insights.

**Verification Hub (Sidebar)**:
The `CandidateSidebar` contains a persistent "Verification Hub" that monitors assessment status. If incomplete, it provides a high-visibility "Complete Now" button that routes users to the `/onboarding/candidate` flow to finalize their signals.

### Recruiter Dashboard Gates

A Recruiter CANNOT access the dashboard unless ALL conditions below are true.

### Mandatory Conditions

1. **Company Sync completed** (`company_id` mapped).
2. **Onboarding step reached** (`onboarding_step = 'COMPLETED'`).
3. **Internal/Company assessment completed**. 
   - Note: If a recruiter joins an existing company that already has a `profile_score > 0`, the assessment gate is bypassed (Company Auto-Sync).

### Blocked State

- If a user is in the `blocked_users` table, access to ALL dashboards is permanently revoked.
- The dashboard UI displays a locking overlay/blur if any condition is missing.

**Recruiter Verification Hub**:
Similar to the candidate flow, recruiters have a persistent status indicator in the `RecruiterSidebar`. If the company has no validated DNA score, job posting and candidate discovery are restricted until a recruiter completes the assessment.

Assessment Rules (Updated Feb 2026)
Assessment can be postponed
Candidates can enter the dashboard after resume upload to browse, but features remain locked until assessment is finished.
Retake is allowed
Candidates can retake the assessment at any time from their profile settings to improve their "Trust Score".
Anti-cheat enforced:
1 tab switch → warning
2 tab switches → account blocked permanently
Dashboard Unlock Behavior
Partial Unlock: Resume upload complete.
Full Unlock: Assessment completion.
No manual approval required.
