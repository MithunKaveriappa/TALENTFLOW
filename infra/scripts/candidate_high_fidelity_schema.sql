-- =========================================
-- High-Fidelity Candidate Profile Expansion
-- Authoritative Schema for Education, Experience, and Career Auditing
-- =========================================

-- 1. Extend candidate_profiles with structured data columns
ALTER TABLE candidate_profiles 
ADD COLUMN IF NOT EXISTS education_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS experience_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_gap_report JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS professional_summary TEXT,
ADD COLUMN IF NOT EXISTS gpa_score NUMERIC(3,2), -- Overall GPA if applicable
ADD COLUMN IF NOT EXISTS graduation_status TEXT;

-- 2. Add audit metadata for AI extraction tracking
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS last_resume_parse_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_extraction_confidence FLOAT DEFAULT 0.0;

-- 3. Update existing resume_data table to match the high-fidelity fields
-- This ensures the audit trail remains consistent
ALTER TABLE resume_data
ADD COLUMN IF NOT EXISTS raw_education JSONB,
ADD COLUMN IF NOT EXISTS raw_experience JSONB,
ADD COLUMN IF NOT EXISTS raw_projects JSONB;

-- 4. Indices for search performance on skills and certifications
CREATE INDEX IF NOT EXISTS idx_candidate_skills ON candidate_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_candidate_certs ON candidate_profiles USING GIN (certifications);

-- 5. Comments for Documentation
COMMENT ON COLUMN candidate_profiles.career_gap_report IS 'Detailed audit of career gaps (>6mo for experienced, >12mo for freshers)';
COMMENT ON COLUMN candidate_profiles.education_history IS 'Array of {institute, degree, year_passing, gpa_or_pcnt}';
COMMENT ON COLUMN candidate_profiles.experience_history IS 'Array of {role, company, tenure_years, achievements, start_date, end_date}';
