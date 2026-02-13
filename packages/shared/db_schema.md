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

**job_status:**

- `active`
- `closed`
- `paused`

**application_status:**

- `applied`
- `shortlisted`
- `interviewed`
- `rejected`
- `offered`
- `closed`

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
- `resume_uploaded` (boolean)
- `identity_verified` (boolean)
- `assessment_status` (assessment_status)
- `trust_score` (virtual/calculated, 0-100) - _Visible to Recruiters_

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
- `terms_accepted` (boolean)
- `account_status` (account_status)
- `updated_at` (timestamp)

### `companies`

- `id` (uuid)
- `name` (text)
- `registration_number` (text, unique)
- `website` (text)
- `domain` (text)
- `location` (text)
- `description` (text)
- `industry_category` (text)
- `size_band` (company_size_band)
- `sales_model` (sales_model_type)
- `target_market` (target_market)
- `hiring_focus_areas` (text[])
- `avg_deal_size_range` (text)
- `profile_score` (integer)
- `candidate_feedback_score` (float)
- `visibility_tier` (text)
- `verification_status` (text)

### `assessment_questions`

- `id` (uuid)
- `category` (text) - behavioral, psychometric, etc.
- `driver` (text) - resilience, communication, etc.
- `experience_band` (experience_band)
- `difficulty` (text)
- `question_text` (text)
- `evaluation_rubric` (text) - AI guidance for unbiased scoring.

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

### `recruiter_assessment_questions`

- `id` (uuid)
- `category` (text)
- `driver` (text)
- `question_text` (text)
- `created_at` (timestamp)

### `recruiter_assessment_responses`

- `id` (uuid)
- `user_id` (uuid)
- `question_text` (text)
- `answer_text` (text)
- `category` (text)
- `average_score` (decimal)
- `evaluation_metadata` (jsonb) - Stores AI reasoning.

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

### `jobs`

- `id` (uuid)
- `company_id` (uuid -> companies.id)
- `recruiter_id` (uuid -> recruiter_profiles.user_id)
- `title` (text)
- `description` (text)
- `requirements` (text[])
- `skills_required` (text[])
- `experience_band` (experience_band)
- `job_type` (job_type)
- `location` (text)
- `salary_range` (text)
- `number_of_positions` (integer)
- `status` (job_status)
- `is_ai_generated` (boolean)
- `closed_at` (timestamp)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `job_applications`

- `id` (uuid)
- `job_id` (uuid -> jobs.id)
- `candidate_id` (uuid -> candidate_profiles.user_id)
- `status` (application_status)
- `feedback` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `saved_jobs`

- `id` (uuid)
- `candidate_id` (uuid -> candidate_profiles.user_id)
- `job_id` (uuid -> jobs.id)
- `created_at` (timestamp)

### `posts`

- `id` (uuid)
- `user_id` (uuid -> users.id)
- `content` (text)
- `media_urls` (text[])
- `type` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `notifications`

- `id` (uuid)
- `user_id` (uuid -> users.id)
- `type` (text)
- `title` (text)
- `message` (text)
- `metadata` (jsonb)
- `is_read` (boolean)
- `created_at` (timestamp)

## Storage Buckets

### `resumes`
- **Purpose**: Stores candidate PDF resumes (uploaded or AI-generated).
- **Structure**: `user_id/resume_name.pdf`
- **RLS**:
    - Select: `(bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])`
    - Insert: `(bucket_id = 'resumes' AND auth.uid() IS NOT NULL)`

### `profile_photos`
- **Purpose**: User avatars.
- **Structure**: `user_id/photo.jpg`
