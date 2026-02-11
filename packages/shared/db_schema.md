# Database Schema Reference (Authoritative)

Updated: February 2026

## Enums

**user_role:**

- `candidate`
- `recruiter`
- `admin`

**experience_band:**

- `fresher`
- `mid`
- `senior`
- `leadership`

**assessment_status:**

- `not_started`
- `in_progress`
- `completed`
- `disqualified`

## Tables

### `users`

- `id` (uuid, auth.users.id)
- `role` (user_role)
- `email` (text)
- `created_at` (timestamp)

### `candidate_profiles`

- `user_id` (uuid, users.id)
- `experience` (experience_band)
- `location` (text)
- `resume_uploaded` (boolean)
- `assessment_status` (assessment_status)
- `skills` (text[])
- `onboarding_step` (text)
- `final_profile_score` (integer)

### `recruiter_profiles`

- `user_id` (uuid, users.id)
- `company_id` (uuid, companies.id)
- `onboarding_step` (text)
- `warning_count` (integer)
- `assessment_status` (assessment_status)

### `companies`

- `id` (uuid)
- `name` (text)
- `registration_number` (text, unique)
- `website` (text)
- `location` (text)
- `description` (text)
- `profile_score` (integer)

### `assessment_questions`

- `id` (uuid)
- `category` (text) - behavioral, psychometric, etc.
- `driver` (text) - resilience, communication, etc.
- `experience_band` (experience_band)
- `difficulty` (text)
- `question_text` (text)
- `keywords` (jsonb)
- `action_verbs` (jsonb)
- `connectors` (jsonb)

### `assessment_sessions`

- `id` (uuid)
- `candidate_id` (uuid, unique)
- `experience_band` (experience_band)
- `status` (text) - started, completed
- `total_budget` (integer)
- `current_step` (integer)
- `warning_count` (integer)
- `overall_score` (float)
- `component_scores` (jsonb)
- `driver_confidence` (jsonb)

### `assessment_responses`

- `id` (uuid)
- `candidate_id` (uuid)
- `question_id` (uuid)
- `category` (text)
- `driver` (text)
- `difficulty` (text)
- `raw_answer` (text)
- `score` (0-6)
- `evaluation_metadata` (jsonb)
- `tab_switches` (integer)
- `time_taken_seconds` (integer)

### `recruiter_assessment_responses`

- `id` (uuid)
- `user_id` (uuid)
- `question_text` (text)
- `answer_text` (text)
- `category` (text)
- `average_score` (decimal)

### `resume_data`

- `user_id` (uuid, users.id)
- `raw_text` (text)
- `timeline` (jsonb)
- `career_gaps` (jsonb)
- `skills` (text[])
- `education` (jsonb)

### `profile_scores`

- `user_id` (uuid)
- `resume_score`
- `behavioral_score`
- `psychometric_score`
- `skills_score`
- `reference_score`
- `final_score`
