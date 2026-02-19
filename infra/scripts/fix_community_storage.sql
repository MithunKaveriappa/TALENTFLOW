-- =============================================
-- FIX: Community Feed Storage Infrastructure
-- =============================================

-- 1. Create the 'community-media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Public Selection Community Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Community Media" ON storage.objects;
DROP POLICY IF EXISTS "Owner Deletion Community Media" ON storage.objects;

-- 3. Policy: Allow anyone to view media (Public Access)
CREATE POLICY "Public Selection Community Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

-- 4. Policy: Allow authenticated users to upload media
CREATE POLICY "Authenticated Upload Community Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow users to delete their own media
CREATE POLICY "Owner Deletion Community Media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Ensure the 'posts' table has 'media_urls' correctly typed (Safety Fix)
ALTER TABLE posts ALTER COLUMN media_urls SET DEFAULT '{}';
ALTER TABLE posts ALTER COLUMN media_urls SET NOT NULL;
