Purpose

This document defines exact conditions under which dashboards unlock.
There are no soft rules—these are hard gates.

Candidate Dashboard Gates
A Candidate CANNOT access the dashboard unless ALL conditions below are true.
Mandatory Conditions
candidate_profiles.experience_band is set
Resume is uploaded
→ candidate_profiles.resume_uploaded = true
Assessment is completed
→ candidate_profiles.assessment_completed = true
Aadhaar is uploaded (file only, no verification)
→ candidate_profiles.aadhaar_uploaded = true
If Any Condition Fails
Dashboard remains locked
User stays in chat-based guided flow
Clear messaging explains what is pending

Recruiter Dashboard Gates
A Recruiter CANNOT access the dashboard unless ALL conditions below are true.
Mandatory Conditions
Recruiter account exists
Company profile is created
Recruiter is mapped to company
Recruiter assessment is completed
→ recruiter_profiles.assessment_completed = true
Company assessment is completed
→ companies.assessment_completed = true
If Any Condition Fails
Dashboard remains locked
Recruiter stays in onboarding chat
System prompts next required step

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
