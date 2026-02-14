Purpose

This document defines exact conditions under which dashboards unlock.
There are no soft rules—these are hard gates.

Candidate Dashboard Gates
A Candidate CANNOT access the dashboard unless ALL conditions below are true.

### Mandatory Conditions

1. **Experience Band set** (`experience` field).
2. **Resume uploaded** (`resume_url` is not null).
3. **Assessment completed** (`assessment_status = 'completed'`).

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

Assessment Rules (Applies to Both)
Assessment is one-time
Cannot be retaken
Can be postponed but not skipped permanently
Anti-cheat enforced:
Copy-paste disabled
1 tab switch → warning
2 tab switches → account blocked permanently
Dashboard Unlock Behavior
Unlock happens immediately after final gate passes
No manual approval
No delay
No partial access
