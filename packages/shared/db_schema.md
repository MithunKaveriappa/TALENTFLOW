# Database Schema Reference (Authoritative)

## Enums

user_role:
- candidate
- recruiter
- admin

experience_band:
- fresher
- mid
- senior
- leadership

assessment_status:
- not_started
- in_progress
- completed
- disqualified

## Tables

users
- id (uuid, auth.users.id)
- role (user_role)
- email (text)
- created_at (timestamp)

candidate_profiles
- user_id (uuid, users.id)
- experience (experience_band)
- location (text)
- resume_uploaded (boolean)
- assessment_status (assessment_status)

companies
- id (uuid)
- name (text)
- registration_number (text, unique)
- website (text)
- location (text)

recruiter_profiles
- user_id (uuid)
- company_id (uuid)
- assessment_status (assessment_status)

assessments
- id (uuid)
- user_id (uuid)
- type (candidate | recruiter)
- status (assessment_status)
- started_at
- completed_at

profile_scores
- user_id (uuid)
- resume_score
- behavioral_score
- psychometric_score
- skills_score
- reference_score
- final_score
