-- Migration to add Branding columns to Companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{"primary": "#2563eb", "secondary": "#64748b"}',
ADD COLUMN IF NOT EXISTS life_at_photo_urls TEXT[] DEFAULT '{}';
