-- Add team_role to recruiter_profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recruiter_profiles' AND column_name='team_role') THEN
        ALTER TABLE public.recruiter_profiles ADD COLUMN team_role TEXT DEFAULT 'recruiter';
    END IF;
END $$;

-- Set existing first recruiters as admins (those who created the company)
-- We'll approximate this by finding the recruiter with the earliest created_at for each company
WITH first_recruiters AS (
    SELECT user_id, 
           ROW_NUMBER() OVER(PARTITION BY company_id ORDER BY created_at ASC) as rank
    FROM public.recruiter_profiles
    WHERE company_id IS NOT NULL
)
UPDATE public.recruiter_profiles
SET team_role = 'admin'
WHERE user_id IN (SELECT user_id FROM first_recruiters WHERE rank = 1);
