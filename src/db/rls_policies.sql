-- rls_policies.sql
-- Enable Row Level Security (RLS) on selected tables and create recommended policies.
-- WARNING: Run this in your Supabase project's SQL editor (Database -> New Query).
-- Review before running. Policy names are dropped if they exist and then (re)created.

/* Tables covered:
profiles, camps, registrations, payments, giyus_steps,
workouts, exercises, videos, teams, messages, user_teams
*/

-- 1) Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.giyus_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_teams ENABLE ROW LEVEL SECURITY;

-- NOTE: If any table name differs in your schema, adjust the names above.

-- 2) Policies
-- 2.a profiles: users can only SELECT/INSERT/UPDATE their own profile
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.b registrations: owner-only access
DROP POLICY IF EXISTS registrations_owner ON public.registrations;
CREATE POLICY registrations_owner ON public.registrations
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.c payments: owner-only access
DROP POLICY IF EXISTS payments_owner ON public.payments;
CREATE POLICY payments_owner ON public.payments
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.d giyus_steps: owner-only access (per-user progress)
DROP POLICY IF EXISTS giyus_steps_owner ON public.giyus_steps;
CREATE POLICY giyus_steps_owner ON public.giyus_steps
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.e user_teams: users can only see/manage their own memberships
DROP POLICY IF EXISTS user_teams_owner ON public.user_teams;
CREATE POLICY user_teams_owner ON public.user_teams
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.f messages: only team members can SELECT; inserts must be by a member and match user_id
DROP POLICY IF EXISTS messages_select_team_members ON public.messages;
CREATE POLICY messages_select_team_members ON public.messages
  FOR SELECT USING (
    (
      EXISTS (
        SELECT 1 FROM public.user_teams ut
        WHERE ut.team_id = public.messages.team_id
          AND ut.user_id = auth.uid()
      )
    ) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS messages_insert_member ON public.messages;
CREATE POLICY messages_insert_member ON public.messages
  FOR INSERT WITH CHECK (
    (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM public.user_teams ut
        WHERE ut.team_id = team_id
          AND ut.user_id = auth.uid()
      )
    ) OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS messages_update_owner ON public.messages;
CREATE POLICY messages_update_owner ON public.messages
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role') WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS messages_delete_owner ON public.messages;
CREATE POLICY messages_delete_owner ON public.messages
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2.g teams: members can SELECT; modifications restricted to service role (trusted backend)
DROP POLICY IF EXISTS teams_select_for_members ON public.teams;
CREATE POLICY teams_select_for_members ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_teams ut
      WHERE ut.team_id = public.teams.id
        AND ut.user_id = auth.uid()
    )
  );
-- allow service role to read teams as well
DROP POLICY IF EXISTS teams_select_service ON public.teams;
CREATE POLICY teams_select_service ON public.teams
  FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS teams_modify_service ON public.teams;
CREATE POLICY teams_modify_service ON public.teams
  FOR ALL USING (auth.role() = 'service_role');

-- 2.h camps, workouts, exercises, videos: by default allow authenticated SELECT (public content)
-- Restrict INSERT/UPDATE/DELETE to service role (trusted backend/admin).

-- camps
DROP POLICY IF EXISTS camps_public_select ON public.camps;
CREATE POLICY camps_public_select ON public.camps
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS camps_modify_service ON public.camps;
CREATE POLICY camps_modify_service ON public.camps
  FOR ALL USING (auth.role() = 'service_role');

-- workouts
DROP POLICY IF EXISTS workouts_public_select ON public.workouts;
CREATE POLICY workouts_public_select ON public.workouts
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS workouts_modify_service ON public.workouts;
CREATE POLICY workouts_modify_service ON public.workouts
  FOR ALL USING (auth.role() = 'service_role');

-- exercises
DROP POLICY IF EXISTS exercises_public_select ON public.exercises;
CREATE POLICY exercises_public_select ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS exercises_modify_service ON public.exercises;
CREATE POLICY exercises_modify_service ON public.exercises
  FOR ALL USING (auth.role() = 'service_role');

-- videos
DROP POLICY IF EXISTS videos_public_select ON public.videos;
CREATE POLICY videos_public_select ON public.videos
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS videos_modify_service ON public.videos;
CREATE POLICY videos_modify_service ON public.videos
  FOR ALL USING (auth.role() = 'service_role');

-- End of file

-- Usage notes:
-- 1) Run the SELECT queries from my earlier message first to inspect current RLS/policy state.
-- 2) This file assumes columns named `user_id` exist where ownership is expected.
-- 3) If you prefer content tables (camps, workouts, exercises, videos) to be owner-restricted,
--    replace the SELECT policies with owner checks similar to profiles (auth.uid() = owner_id).
-- 4) If any DROP/CREATE fails due to naming differences, adjust policy names or table names and retry.
-- 5) After applying, test with a normal user JWT and with the service role to ensure behavior matches expectations.
