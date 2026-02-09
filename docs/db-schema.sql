-- =========================================
-- TalentFlow Database Schema
-- Authoritative Schema Definition
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

CREATE TYPE assessment_type AS ENUM (
  'candidate',
  'recruiter'
);

CREATE TYPE assessment_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'disqualified'
);

-- ---------- USERS ----------

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- CANDIDATE PROFILE ----------

CREATE TABLE candidate_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  experience experience_band NOT NULL,
  location TEXT,
  resume_uploaded BOOLEAN DEFAULT false,
  assessment_status assessment_status DEFAULT 'not_started',
  skills TEXT[], -- Final verified skills (AI Extracted + User Added)
  onboarding_step TEXT DEFAULT 'INITIAL', -- Current step for persistence
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

-- ---------- COMPANIES ----------

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE,
  website TEXT,
  location TEXT,
  description TEXT,
  profile_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- RECRUITER PROFILE ----------

CREATE TABLE recruiter_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  onboarding_step TEXT DEFAULT 'REGISTRATION',
  warning_count INTEGER DEFAULT 0,
  assessment_status assessment_status DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- BLOCKED USERS ----------

CREATE TABLE blocked_users (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ---------- ASSESSMENT QUESTIONS ----------

CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- behavioral, psychometric, cultural, reference
    driver TEXT NOT NULL,   -- resilience, communication, growth_potential, etc.
    experience_band experience_band NOT NULL,
    difficulty TEXT NOT NULL,      -- low, medium, high
    question_text TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    action_verbs TEXT[] DEFAULT '{}',
    connectors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- ASSESSMENT SESSIONS ----------

CREATE TABLE assessment_sessions (
    candidate_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    experience_band experience_band NOT NULL,
    status TEXT NOT NULL, -- started, completed
    total_budget INTEGER NOT NULL,
    current_step INTEGER DEFAULT 1,
    warning_count INTEGER DEFAULT 0,
    driver_confidence JSONB DEFAULT '{}',
    component_scores JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------- ASSESSMENT RESPONSES ----------

CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(id), 
    category TEXT NOT NULL,
    driver TEXT,
    difficulty TEXT,
    raw_answer TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 6),
    evaluation_metadata JSONB DEFAULT '{}',
    is_skipped BOOLEAN DEFAULT false,
    tab_switches INTEGER DEFAULT 0,
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
  average_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- ASSESSMENTS ----------

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type assessment_type NOT NULL,
  status assessment_status NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
