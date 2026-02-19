-- Migration to synchronize recruiter_settings with the latest schema
-- 1. Remove Two-Factor Authentication (fully deprecated)
-- 2. Ensure all other modern fields exist (language, timezone, notifications)

DO $$ 
BEGIN
    -- Drop two_factor_enabled if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='recruiter_settings' AND column_name='two_factor_enabled') THEN
        ALTER TABLE public.recruiter_settings DROP COLUMN two_factor_enabled;
    END IF;

    -- Ensure language exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='recruiter_settings' AND column_name='language') THEN
        ALTER TABLE public.recruiter_settings ADD COLUMN language TEXT DEFAULT 'en';
    END IF;

    -- Ensure timezone exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='recruiter_settings' AND column_name='timezone') THEN
        ALTER TABLE public.recruiter_settings ADD COLUMN timezone TEXT DEFAULT 'UTC';
    END IF;

    -- Ensure profile_visibility exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='recruiter_settings' AND column_name='profile_visibility') THEN
        ALTER TABLE public.recruiter_settings ADD COLUMN profile_visibility TEXT DEFAULT 'public';
    END IF;
END $$;

-- Update updated_at trigger for recruiter_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_recruiter_settings_timestamp ON public.recruiter_settings;
CREATE TRIGGER tr_update_recruiter_settings_timestamp
BEFORE UPDATE ON public.recruiter_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
