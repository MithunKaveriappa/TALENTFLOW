-- Migration to add warning_count to assessment_sessions
ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
