-- =========================================
-- Interview Scheduling Schema
-- =========================================

-- ---------- ENUM TYPES ----------
DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM (
        'pending_confirmation', -- Recruiter proposed slots, waiting for candidate
        'scheduled',            -- Candidate confirmed a slot
        'completed',            -- Interview finished
        'cancelled'             -- Interview cancelled
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interview_format AS ENUM (
        'virtual',
        'onsite'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ---------- INTERVIEWS ----------
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES recruiter_profiles(user_id) ON DELETE CASCADE,
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    
    status interview_status DEFAULT 'pending_confirmation',
    round_name TEXT NOT NULL, -- e.g. "Technical Interview", "HR Round"
    round_number INTEGER DEFAULT 1,
    format interview_format DEFAULT 'virtual',
    
    -- For virtual interviews
    meeting_link TEXT,
    
    -- For onsite interviews
    location TEXT,
    
    interviewer_names TEXT[] DEFAULT '{}',
    feedback TEXT, -- Added after completion
    cancellation_reason TEXT, -- Added if cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- INTERVIEW SLOTS ----------
CREATE TABLE IF NOT EXISTS interview_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_selected BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- RLS POLICIES ----------
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_slots ENABLE ROW LEVEL SECURITY;

-- Recruiters can view interviews they created or for their company's jobs
CREATE POLICY "Recruiters can view their interviews" ON interviews
    FOR SELECT USING (
        auth.uid() = recruiter_id OR 
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = interviews.job_id 
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- Recruiters can create interviews
CREATE POLICY "Recruiters can create interviews" ON interviews
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM recruiter_profiles WHERE user_id = auth.uid())
    );

-- Recruiters can update interviews they manage
CREATE POLICY "Recruiters can update their interviews" ON interviews
    FOR UPDATE USING (
        auth.uid() = recruiter_id OR 
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = interviews.job_id 
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- Candidates can view their own interviews
CREATE POLICY "Candidates can view their interviews" ON interviews
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can confirm a slot (update status/is_selected)
CREATE POLICY "Candidates can update interview slot selection" ON interviews
    FOR UPDATE USING (auth.uid() = candidate_id);

-- Slots RLS (dependent on interview access)
CREATE POLICY "Viewable slots" ON interview_slots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_slots.interview_id
            AND (interviews.candidate_id = auth.uid() OR interviews.recruiter_id = auth.uid())
        )
    );

CREATE POLICY "Recruiters can manage slots" ON interview_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_slots.interview_id
            AND interviews.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can select slots" ON interview_slots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_slots.interview_id
            AND interviews.candidate_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_slots_interview_id ON interview_slots(interview_id);
