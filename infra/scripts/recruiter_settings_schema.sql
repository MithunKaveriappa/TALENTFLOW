-- =========================================
-- Recruiter Account Settings & Preferences
-- Centralized repository for recruiter-specific configurations.
-- =========================================

CREATE TABLE IF NOT EXISTS recruiter_settings (
    user_id UUID PRIMARY KEY REFERENCES recruiter_profiles(user_id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    web_notifications BOOLEAN DEFAULT true,
    mobile_notifications BOOLEAN DEFAULT false,
    profile_visibility TEXT DEFAULT 'public', -- 'public', 'team_only', 'private'
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger to initialize settings on recruiter profile creation
CREATE OR REPLACE FUNCTION public.initialize_recruiter_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.recruiter_settings (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_initialize_recruiter_settings ON public.recruiter_profiles;
CREATE TRIGGER tr_initialize_recruiter_settings
AFTER INSERT ON public.recruiter_profiles
FOR EACH ROW
EXECUTE FUNCTION public.initialize_recruiter_settings();

-- Seed initial settings for existing recruiters
INSERT INTO public.recruiter_settings (user_id)
SELECT user_id FROM public.recruiter_profiles
ON CONFLICT (user_id) DO NOTHING;
