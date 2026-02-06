# Row Level Security (RLS) Policies – TalentFlow

## Purpose

Row Level Security (RLS) ensures that:
- Users can only access their own data
- Recruiters cannot directly access candidate internals
- Frontend clients cannot bypass business rules
- Backend (FastAPI) remains the single source of truth

All tables have RLS enabled by default.

---

## Authentication Model

- Supabase Auth issues JWT tokens
- `auth.uid()` represents the currently authenticated user
- Frontend uses the anon key (RLS enforced)
- Backend uses the service role key (RLS bypassed)

---

## RLS Strategy Overview

| Table | Who Can Read | Who Can Write |
|------|-------------|---------------|
| users | Owner only | Backend only |
| candidate_profiles | Candidate (self) | Candidate (limited) / Backend |
| recruiter_profiles | Recruiter (self) | Recruiter (limited) / Backend |
| companies | Recruiter (own company) | Backend only |
| assessments | Owner only | Backend only |
| profile_scores | Owner only | Backend only |

---

## Policies by Table

### users
- Read: User can read only their own row
- Insert/Update/Delete: Not allowed from frontend

Reason:
- Prevent role escalation
- Prevent email tampering

---

### candidate_profiles
- Read: Candidate can read their own profile
- Update: Candidate can update allowed fields
- Insert/Delete: Backend only

Reason:
- Profile ownership enforcement
- Controlled assessment flow

---

### recruiter_profiles
- Read: Recruiter can read their own profile
- Update: Recruiter can update allowed fields
- Insert/Delete: Backend only

---

### companies
- Read: Recruiter can read only their associated company
- Write: Backend only

Reason:
- Prevent company impersonation
- Prevent unauthorized edits

---

### assessments
- Read: User can read their own assessment records
- Write: Backend only

Reason:
- Prevent assessment manipulation
- Enforce one-attempt rule

---

### profile_scores
- Read: User can read only their own score
- Write: Backend only

Reason:
- Scores are derived data
- No direct user manipulation

---

## Backend Bypass (Service Role)

FastAPI uses the Supabase `service_role` key, which:
- Bypasses RLS
- Is never exposed to frontend
- Is required for:
  - scoring
  - assessment state transitions
  - admin actions

This ensures:
- Business logic stays in backend
- Frontend remains untrusted

---

## Future Notes

- Additional policies will be added for jobs & applications
- Audit logging may be added in later phases
