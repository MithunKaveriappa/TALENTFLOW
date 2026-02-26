-- Migration: Add Salary and Location Tier to Candidate Profiles
-- Description: Adds expected_salary and location_tier columns for recruiter talent pool visualization

ALTER TABLE candidate_profiles 
ADD COLUMN IF NOT EXISTS expected_salary BIGINT,
ADD COLUMN IF NOT EXISTS location_tier TEXT;

COMMENT ON COLUMN candidate_profiles.expected_salary IS 'Candidate annual salary expectations in local currency';
COMMENT ON COLUMN candidate_profiles.location_tier IS 'AI-classified city tier (Tier 1, Tier 2, etc.) based on location';
