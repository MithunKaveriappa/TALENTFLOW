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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ---------- RECRUITER PROFILE ----------

CREATE TABLE recruiter_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  assessment_status assessment_status DEFAULT 'not_started',
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
