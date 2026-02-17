Platform Roles

1. Candidate
   An individual seeking IT Tech Sales roles.
   Core Capabilities
   Sign up using personal email only
   Build profile via:
   experience band selection
   resume upload
   skill entry
   assessment
   Upload Aadhaar (file only, Phase-1)
   Access Candidate Dashboard only after gates are cleared
   Allowed Actions
   Edit limited profile fields (non-critical)
   Apply for jobs
   View recommended jobs & companies
   Track application status
   View profile score & feedback
   Use Career GPS
   Post engagement content
   Participate in controlled chat flows
   Receive notifications
   Manage account settings
   Restricted Actions
   Cannot view recruiter/company assessments
   Cannot see raw assessment answers
   Cannot access recruiter dashboard
   Cannot retake assessment
   Cannot bypass Aadhaar upload
   Cannot access admin routes

2. Recruiter
   A person representing a company hiring candidates.
   Core Capabilities
   Sign up using professional email only
   Belong to one company
   Multiple recruiters can belong to the same company
   Complete recruiter assessment to unlock dashboard
   Allowed Actions
   Manage recruiter profile
   Manage company profile (based on role)
   Post jobs (AI-assisted or manual)
   View Applied Pipeline (Category A)
   View Recommended Talent (Category B)
   Bulk shortlist/reject applicants
   Send personalized invites with Job context
   Shortlist / reject candidates (with feedback)
   Schedule interviews (Jitsi virtual rooms)
   Track candidate application history
   Post engagement content
   Use controlled chat (Unlocked at Shortlist status)
   Receive notifications
   Manage account settings
   Restricted Actions
   Cannot see candidate raw assessment answers
   Cannot bypass company assessment
   Cannot access candidate dashboard
   Cannot access admin routes
   Cannot edit company score directly

3. Admin
   System-level operator.
   Core Capabilities
   Login via pre-seeded admin credentials
   View all users, recruiters, and companies
   Monitor platform activity
   Perform support/debug actions
   Allowed Actions
   Read all data
   Perform backend-level operations (via service role)
   Access admin-only APIs and dashboards
   Restricted Actions
   Does not participate in assessments
   Does not act as candidate or recruiter
   Not part of marketplace matching logic
   Access Enforcement Rules
   Role is immutable after signup
   All APIs are role-guarded
   Frontend routing must respect role
   Backend is final authority on access
   Admin bypasses RLS using service role
