-- =========================================
-- TalentFlow Database Schema
-- Authoritative Schema Definition (Updated Feb 2026)
-- =========================================

-- ---------- ENUM TYPES ----------

CREATE TYPE user_role AS ENUM (
  'candidate',
  'recruiter',
  'admin'
);

CREATE TYPE experience_band AS ENUM (
  'fresher',
  'mid',
  'senior',
  'leadership'
);

CREATE TYPE assessment_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'disqualified'
);

CREATE TYPE employment_status AS ENUM (
  'Employed', 
  'Unemployed', 
  'Student'
);

CREATE TYPE company_size_band AS ENUM (
  '1-10', 
  '11-50', 
  '51-200', 
  '201-500', 
  '501-1000', 
  '1000+'
);

CREATE TYPE sales_model_type AS ENUM (
  'Inbound', 
  'Outbound', 
  'Hybrid'
);

CREATE TYPE target_market AS ENUM (
  'SMB', 
  'Mid-market', 
  'Enterprise'
);

CREATE TYPE account_status AS ENUM (
  'Active', 
  'Restricted', 
  'Suspended', 
  'Blocked'
);

CREATE TYPE profile_strength AS ENUM (
  'Low', 
  'Moderate', 
  'Strong', 
  'Elite'
);

CREATE TYPE job_type AS ENUM (
  'remote', 
  'hybrid', 
  'onsite'
);

-- ---------- USERS ----------

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- COMPANIES ----------

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  website TEXT,
  location TEXT,
  description TEXT,
  industry_category TEXT,
  size_band company_size_band,
  sales_model sales_model_type,
  target_market target_market,
  profile_score INTEGER DEFAULT 0,
  visibility_tier TEXT DEFAULT 'Low',
  verification_status TEXT DEFAULT 'Under Review',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- CANDIDATE PROFILE ----------

CREATE TABLE candidate_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  profile_photo_url TEXT,
  bio TEXT,
  experience experience_band NOT NULL,
  location TEXT,
  "current_role" TEXT,
  years_of_experience INTEGER,
  primary_industry_focus TEXT,
  current_employment_status employment_status,
  current_company_name TEXT,
  previous_companies TEXT[] DEFAULT '{}',
  key_responsibilities TEXT,
  major_achievements TEXT,
  resume_uploaded BOOLEAN DEFAULT false,
  assessment_status assessment_status DEFAULT 'not_started',
  skills TEXT[], 
  sales_metrics JSONB DEFAULT '{}',
  crm_tools TEXT[] DEFAULT '{}',
  sales_methodologies TEXT[] DEFAULT '{}',
  product_domain_expertise TEXT[] DEFAULT '{}',
  target_market_exposure TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  learning_links JSONB DEFAULT '[]',
  career_interests TEXT[] DEFAULT '{}',
  learning_interests TEXT[] DEFAULT '{}',
  job_type job_type DEFAULT 'onsite',
  social_links JSONB DEFAULT '{}',
  onboarding_step TEXT DEFAULT 'INITIAL',
  profile_strength profile_strength DEFAULT 'Low',
  completion_score INTEGER DEFAULT 0,
  final_profile_score INTEGER,
  identity_verified BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  account_status account_status DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- RECRUITER PROFILE ----------

CREATE TABLE recruiter_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  full_name TEXT,
  phone_number TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  onboarding_step TEXT DEFAULT 'REGISTRATION',
  warning_count INTEGER DEFAULT 0,
  completion_score INTEGER DEFAULT 0,
  assessment_status assessment_status DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- BLOCKED USERS ----------

CREATE TABLE blocked_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- ASSESSMENT QUESTIONS BANK ----------

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- behavioral, psychometric, reference, skill
    driver TEXT NOT NULL,   -- resilience, communication, growth_potential, etc.
    experience_band experience_band NOT NULL,
    difficulty TEXT NOT NULL, -- low, medium, high
    question_text TEXT NOT NULL,
    keywords JSONB DEFAULT '[]',
    action_verbs JSONB DEFAULT '[]',
    connectors JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- ASSESSMENT SESSIONS ----------

CREATE TABLE assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    experience_band experience_band NOT NULL,
    status TEXT DEFAULT 'started', -- started, completed
    total_budget INTEGER, 
    current_step INTEGER DEFAULT 1,
    warning_count INTEGER DEFAULT 0,
    overall_score FLOAT DEFAULT 0.0,
    component_scores JSONB DEFAULT '{}', -- {skill: 80, behavioral: 70...}
    driver_confidence JSONB DEFAULT '{}', -- {resilience: 2...}
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ---------- ASSESSMENT RESPONSES ----------

CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(id), -- Null for AI-generated
    category TEXT NOT NULL,
    driver TEXT,
    difficulty TEXT,
    raw_answer TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 6),
    evaluation_metadata JSONB DEFAULT '{}',
    is_skipped BOOLEAN DEFAULT false,
    tab_switches INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- RECRUITER ASSESSMENT RESPONSES ----------

CREATE TABLE recruiter_assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    category TEXT NOT NULL,
    relevance_score INTEGER,
    specificity_score INTEGER,
    clarity_score INTEGER,
    ownership_score INTEGER,
    average_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- RESUME DATA (PARSED) ----------

CREATE TABLE resume_data (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  raw_text TEXT,
  timeline JSONB, -- [ {role, company, start, end} ]
  career_gaps JSONB, -- { count, details }
  achievements TEXT[],
  skills TEXT[],
  education JSONB,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- PROFILE SCORES ----------

CREATE TABLE profile_scores (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  resume_score INTEGER,
  behavioral_score INTEGER,
  psychometric_score INTEGER,
  skills_score INTEGER,
  reference_score INTEGER,
  final_score INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =========================================
-- SECURITY & RLS POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_scores ENABLE ROW LEVEL SECURITY;

-- Helper Function
CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
  SELECT auth.uid() IS NOT NULL;
$$ LANGUAGE sql STABLE;

-- ---------- POLICIES ----------

-- Users
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can read own record" ON users FOR SELECT USING (id = auth.uid());

-- Companies
CREATE POLICY "Recruiter can read own company" 
ON companies FOR SELECT 
USING (id IN (SELECT company_id FROM recruiter_profiles WHERE user_id = auth.uid()));

-- Candidate Profiles
CREATE POLICY "Candidate can read own profile" ON candidate_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Candidate can update own profile" ON candidate_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can manage own candidate profile" 
ON candidate_profiles FOR ALL 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Recruiter Profiles
CREATE POLICY "Recruiter can read own profile" ON recruiter_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Recruiter can update own profile" ON recruiter_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can manage own recruiter profile" 
ON recruiter_profiles FOR ALL 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Blocked Users
CREATE POLICY "Allow users to check their own blocked status" ON blocked_users FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Read access for blocked status check" ON blocked_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can check their own blocked status" ON blocked_users FOR SELECT USING (auth.uid() = user_id);

-- Assessment Questions
CREATE POLICY "Allow authenticated read access to questions" 
ON assessment_questions FOR SELECT TO authenticated USING (true);

-- Assessment Sessions
CREATE POLICY "Users can manage their own session" 
ON assessment_sessions FOR ALL TO authenticated 
USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Assessment Responses
CREATE POLICY "Users can manage their own responses" 
ON assessment_responses FOR ALL TO authenticated 
USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- Resume Data
CREATE POLICY "Users can manage their own resume data" 
ON resume_data FOR ALL 
USING (auth.uid() = user_id);

-- Profile Scores
CREATE POLICY "User can read own profile score" 
ON profile_scores FOR SELECT USING (user_id = auth.uid());

-- ---------- STORAGE POLICIES ----------

-- Resumes Bucket
-- INSERT: (bucket_id = 'resumes' AND auth.uid() IS NOT NULL)
-- SELECT: (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])

-- Documents Bucket (Aadhaar etc)
-- INSERT: (bucket_id = 'documents' AND auth.uid() IS NOT NULL)
-- SELECT: (bucket_id = 'documents' AND (SELECT auth.uid()) = owner)
