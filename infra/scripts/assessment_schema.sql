-- Table for predefined questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- behavioral, psychometric, cultural, reference
    driver TEXT NOT NULL,   -- resilience, communication, etc.
    experience_band TEXT NOT NULL, -- fresher, mid, senior, leadership
    difficulty TEXT NOT NULL,      -- low, medium, high
    question_text TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    action_verbs TEXT[] DEFAULT '{}',
    connectors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for storing assessment results
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.assessment_questions(id), 
    category TEXT NOT NULL,
    driver TEXT,
    difficulty TEXT,
    raw_answer TEXT,
    score INT CHECK (score >= 0 AND score <= 6),
    evaluation_metadata JSONB DEFAULT '{}',
    is_skipped BOOLEAN DEFAULT false,
    tab_switches INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for blocked users (Security)
CREATE TABLE IF NOT EXISTS public.blocked_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT now()
);

-- track session state to prevent retakes and manage current progress
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS assessment_status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
ADD COLUMN IF NOT EXISTS assessment_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS final_profile_score INT;

-- RLS Policies
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses" ON public.assessment_responses
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "System can insert responses" ON public.assessment_responses
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);
