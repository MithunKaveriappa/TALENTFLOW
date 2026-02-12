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

**employment_status:**

- `Employed`
- `Unemployed`
- `Student`

**company_size_band:**

- `1-10`
- `11-50`
- `51-200`
- `201-500`
- `501-1000`
- `1000+`

**sales_model_type:**

- `Inbound`
- `Outbound`
- `Hybrid`

**target_market:**

- `SMB`
- `Mid-market`
- `Enterprise`

**account_status:**

- `Active`
- `Restricted`
- `Suspended`
- `Blocked`

**profile_strength:**

- `Low`
- `Moderate`
- `Strong`
- `Elite`

**job_type:**

- `remote`
- `hybrid`
- `onsite`

## Tables

### `users`

- `id` (uuid, auth.users.id)
- `role` (user_role)
- `email` (text)
- `created_at` (timestamp)

### `candidate_profiles`

- `user_id` (uuid, users.id)
- `full_name` (text)
- `phone_number` (text)
- `profile_photo_url` (text)
- `bio` (text)
- `experience` (experience_band)
- `location` (text)
- `current_role` (text)
- `years_of_experience` (integer)
- `primary_industry_focus` (text)
- `current_employment_status` (employment_status)
- `current_company_name` (text)
- `previous_companies` (text[])
- `key_responsibilities` (text)
- `major_achievements` (text)
- `resume_uploaded` (boolean)
- `assessment_status` (assessment_status)
- `skills` (text[])
- `sales_metrics` (jsonb)
- `crm_tools` (text[])
- `sales_methodologies` (text[])
- `product_domain_expertise` (text[])
- `target_market_exposure` (text)
- `linkedin_url` (text)
- `portfolio_url` (text)
- `learning_links` (jsonb)
- `career_interests` (text[])
- `learning_interests` (text[])
- `job_type` (job_type)
- `social_links` (jsonb)
- `onboarding_step` (text)
- `profile_strength` (profile_strength)
- `completion_score` (integer)
- `final_profile_score` (integer)
- `identity_verified` (boolean)
- `terms_accepted` (boolean)
- `account_status` (account_status)
- `updated_at` (timestamp)

### `recruiter_profiles`

- `user_id` (uuid, users.id)
- `company_id` (uuid, companies.id)
- `full_name` (text)
- `phone_number` (text)
- `job_title` (text)
- `linkedin_url` (text)
- `onboarding_step` (text)
- `warning_count` (integer)
- `completion_score` (integer)
- `assessment_status` (assessment_status)
- `updated_at` (timestamp)

### `companies`

- `id` (uuid)
- `name` (text)
- `registration_number` (text, unique)
- `website` (text)
- `location` (text)
- `description` (text)
- `industry_category` (text)
- `size_band` (company_size_band)
- `sales_model` (sales_model_type)
- `target_market` (target_market)
- `profile_score` (integer)
- `visibility_tier` (text)
- `verification_status` (text)

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
