-- Feature: Pinned Signals (Posts)
-- Allows users to save/pin signals to their tactical dashboard
CREATE TABLE IF NOT EXISTS public.user_pinned_posts (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    pinned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

-- Index for rapid retrieval by user
CREATE INDEX IF NOT EXISTS idx_pinned_posts_user ON public.user_pinned_posts(user_id);

-- Gating: Maximum 50 pins per user - check is handled in the API layer.

-- Row Level Security (RLS)
ALTER TABLE public.user_pinned_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own pins
DROP POLICY IF EXISTS "Users can view their own pins" ON public.user_pinned_posts;
CREATE POLICY "Users can view their own pins" ON public.user_pinned_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only create their own pins
DROP POLICY IF EXISTS "Users can pin their own" ON public.user_pinned_posts;
CREATE POLICY "Users can pin their own" ON public.user_pinned_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own pins
DROP POLICY IF EXISTS "Users can unpin their own" ON public.user_pinned_posts;
CREATE POLICY "Users can unpin their own" ON public.user_pinned_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Note: The Backend (FastAPI) uses a Service Role key, so it can bypass these if needed,
-- but having policies here ensures the frontend cannot spoof or access other users' pins.
