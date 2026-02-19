-- Add resume_path and resume_url to candidate_profiles 
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_path TEXT;
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;

