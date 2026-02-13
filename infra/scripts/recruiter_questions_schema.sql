-- Table for recruiter-specific assessment questions
CREATE TABLE IF NOT EXISTS public.recruiter_assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- recruiter_intent, recruiter_icp, recruiter_ethics, recruiter_cvp, recruiter_ownership
    driver TEXT NOT NULL,   -- e.g., Strategic Intent, Universal DNA, Fairness
    question_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recruiter_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone logged in can view these (to facilitate the assessment)
CREATE POLICY "Recruiters can view assessment questions" ON public.recruiter_assessment_questions
    FOR SELECT USING (auth.role() = 'authenticated');
