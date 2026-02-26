-- Migration to add Identity Verification columns to candidate_profiles
-- Ensures proof path is tracked for manual recruiter audit

ALTER TABLE candidate_profiles 
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS identity_proof_path TEXT;

-- Create indices if needed
-- CREATE INDEX IF NOT EXISTS idx_profile_verified ON candidate_profiles(identity_verified);
