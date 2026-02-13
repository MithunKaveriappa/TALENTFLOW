-- Migration: Add question_text to assessment_responses
-- This ensures that AI-generated questions (resume, skills) are preserved 
-- alongside the candidate's answer for audit and review.

ALTER TABLE public.assessment_responses 
ADD COLUMN IF NOT EXISTS question_text TEXT;

-- Update the RLS if necessary (usually not needed for just a new column 
-- if the table-level policy is broad enough, but good to keep in mind)
