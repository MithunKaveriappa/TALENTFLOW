-- Adding invitation_message to job_applications
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS invitation_message TEXT;
