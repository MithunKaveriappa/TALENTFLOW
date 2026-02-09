-- 1. Assessment Questions Bank
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- behavioral, psychometric, reference, skill
    driver TEXT NOT NULL,   -- resilience, communication, growth_potential, etc.
    experience_band TEXT NOT NULL, -- fresher, mid, senior, leadership
    difficulty TEXT NOT NULL, -- low, medium, high
    question_text TEXT NOT NULL,
    keywords JSONB DEFAULT '[]', -- Using JSONB for easier keyword matching
    action_verbs JSONB DEFAULT '[]',
    connectors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Assessment Responses (Detailed Q&A Storage)
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.assessment_questions(id), -- Null for AI-generated questions
    category TEXT NOT NULL,
    driver TEXT,
    difficulty TEXT,
    raw_answer TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 6),
    evaluation_metadata JSONB DEFAULT '{}', -- Stores AI reasoning / matched keywords
    is_skipped BOOLEAN DEFAULT false,
    tab_switches INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Blocked Users (Permanent Ban due to tab switching)
CREATE TABLE IF NOT EXISTS public.blocked_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Assessment Session State (Manage budget and confidence-based stopping)
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    experience_band TEXT NOT NULL,
    status TEXT DEFAULT 'started', -- started, completed
    total_budget INTEGER, -- Max questions allowed
    current_step INTEGER DEFAULT 1,
    overall_score FLOAT DEFAULT 0.0,
    component_scores JSONB DEFAULT '{}', -- {resume: 80, behavioral: 70...}
    driver_confidence JSONB DEFAULT '{}', -- {resilience: 2, communication: 0...}
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 5. Update Candidate Profile to reflect assessment status
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS assessment_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS final_profile_score INTEGER;

-- Enable RLS
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Questions: Read access for all authenticated users
CREATE POLICY "Allow authenticated read access to questions" 
ON public.assessment_questions FOR SELECT TO authenticated USING (true);

-- Responses: Only owner can view/insert
CREATE POLICY "Users can manage their own responses" 
ON public.assessment_responses FOR ALL TO authenticated 
USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Blocked Users: Everyone can check if they are blocked
CREATE POLICY "Read access for blocked status check" 
ON public.blocked_users FOR SELECT TO authenticated USING (true);

-- Sessions: Only owner can manage
CREATE POLICY "Users can manage their own session" 
ON public.assessment_sessions FOR ALL TO authenticated 
USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);
