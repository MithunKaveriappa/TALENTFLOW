-- Migration to add demographic and education fields to candidate_profiles
-- Used for the high-fidelity recruiter profile view

ALTER TABLE candidate_profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS qualification_held TEXT,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS referral TEXT;

-- Update existing profiles with dummy data for testing if needed
-- UPDATE candidate_profiles SET gender = 'Female', birthdate = '2000-05-20', university = 'Boston University', qualification_held = 'Bachelor of Engineering', graduation_year = 2014 WHERE full_name = 'Kristi Sipes';
