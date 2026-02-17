-- Migration: Analytics & Conversion Funnel
-- Author: GitHub Copilot (Gemini 3 Flash)
-- Date: Feb 2026

-- 1. Create job_views table for conversion tracking
CREATE TABLE IF NOT EXISTS job_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indices for performance
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);

-- 3. RLS for job_views
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY anyone_can_log_view ON job_views FOR INSERT WITH CHECK (true);
CREATE POLICY recruiter_view_own_job_stats ON job_views 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = job_views.job_id 
            AND jobs.recruiter_id = auth.uid()
        )
    );
