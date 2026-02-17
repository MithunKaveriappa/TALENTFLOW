-- Fix relationships for chat_threads to allow direct joins to profiles
ALTER TABLE chat_threads
DROP CONSTRAINT IF EXISTS chat_threads_candidate_id_fkey,
DROP CONSTRAINT IF EXISTS chat_threads_recruiter_id_fkey;

ALTER TABLE chat_threads
ADD CONSTRAINT chat_threads_candidate_id_fkey 
FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE chat_threads
ADD CONSTRAINT chat_threads_recruiter_id_fkey 
FOREIGN KEY (recruiter_id) REFERENCES recruiter_profiles(user_id) ON DELETE CASCADE;
