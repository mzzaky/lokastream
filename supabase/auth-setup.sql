-- =====================================================
-- LOKASTREAM AUTH & RLS UPDATES
-- Run this AFTER the main schema.sql
-- =====================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Streamers can manage their mabar settings" ON public.mabar_settings;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Allow users to view all user profiles (needed for public mabar pages)
CREATE POLICY "Anyone can view user profiles" ON public.users
    FOR SELECT USING (true);

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- MABAR SETTINGS POLICIES
-- =====================================================

-- Allow anyone to view active mabar settings (for public mabar pages)
DROP POLICY IF EXISTS "Anyone can view active mabar settings" ON public.mabar_settings;
CREATE POLICY "Anyone can view active mabar settings" ON public.mabar_settings
    FOR SELECT USING (true);

-- Allow streamers to insert their own mabar settings
CREATE POLICY "Streamers can create mabar settings" ON public.mabar_settings
    FOR INSERT WITH CHECK (auth.uid() = streamer_id);

-- Allow streamers to update their own mabar settings
CREATE POLICY "Streamers can update mabar settings" ON public.mabar_settings
    FOR UPDATE USING (auth.uid() = streamer_id);

-- Allow streamers to delete their own mabar settings
CREATE POLICY "Streamers can delete mabar settings" ON public.mabar_settings
    FOR DELETE USING (auth.uid() = streamer_id);

-- =====================================================
-- QUEUE ENTRIES POLICIES (update existing)
-- =====================================================

DROP POLICY IF EXISTS "Streamers can update queue entries" ON public.queue_entries;

-- Streamers can update entries for their streams
CREATE POLICY "Streamers can update own queue entries" ON public.queue_entries
    FOR UPDATE USING (auth.uid() = streamer_id);

-- Streamers can delete entries from their queue
CREATE POLICY "Streamers can delete own queue entries" ON public.queue_entries
    FOR DELETE USING (auth.uid() = streamer_id);

-- =====================================================
-- GAME SESSIONS POLICIES (update existing)
-- =====================================================

DROP POLICY IF EXISTS "Streamers can manage game sessions" ON public.game_sessions;

-- Allow streamers to insert game sessions
CREATE POLICY "Streamers can create game sessions" ON public.game_sessions
    FOR INSERT WITH CHECK (auth.uid() = streamer_id);

-- Allow streamers to update their game sessions
CREATE POLICY "Streamers can update game sessions" ON public.game_sessions
    FOR UPDATE USING (auth.uid() = streamer_id);

-- =====================================================
-- MVP RECORDS POLICIES (update existing)
-- =====================================================

DROP POLICY IF EXISTS "Streamers can manage MVP records" ON public.mvp_records;

-- Allow streamers to insert MVP records
CREATE POLICY "Streamers can create MVP records" ON public.mvp_records
    FOR INSERT WITH CHECK (auth.uid() = streamer_id);

-- Allow streamers to update their MVP records
CREATE POLICY "Streamers can update MVP records" ON public.mvp_records
    FOR UPDATE USING (auth.uid() = streamer_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that all policies are in place
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
