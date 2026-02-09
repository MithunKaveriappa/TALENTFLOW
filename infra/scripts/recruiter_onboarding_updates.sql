-- Add description and profile_score to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS profile_score INTEGER DEFAULT 0;

-- Add onboarding_step to recruiter_profiles
ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'REGISTRATION';

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure user_role has recruiter if not already there (it is in schema but just in case)
-- Create a table for recruiter assessment responses if we want to separate from candidate
CREATE TABLE IF NOT EXISTS recruiter_assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    category TEXT NOT NULL,
    relevance_score INTEGER,
    specificity_score INTEGER,
    clarity_score INTEGER,
    ownership_score INTEGER,
    average_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
