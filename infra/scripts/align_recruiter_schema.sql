-- Migration to align Recruiter Assessment with Unbiased AI Engine
-- Adds evaluation_metadata to match the candidate assessment structure

ALTER TABLE recruiter_assessment_responses 
ADD COLUMN IF NOT EXISTS evaluation_metadata JSONB DEFAULT '{}';

-- Optional: Add index for performance
CREATE INDEX IF NOT EXISTS idx_recruiter_responses_user ON recruiter_assessment_responses(user_id);
