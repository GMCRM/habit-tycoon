-- Enable Supabase Realtime on user_profiles so a cash/net_worth change made
-- by someone ELSE's action — most commonly a dividend payout landing from
-- another user's habit completion — is pushed live to the receiving
-- stockholder's client, instead of sitting invisible until they happen to
-- navigate away and back (which is the only thing that currently re-reads
-- the profile row) or the unrelated 20s habit-completions poll fallback
-- fires (which refreshes the habit list but never the cash figure — see
-- HabitRealtimeService/home.page.ts).
--
-- Mirrors 20260819010000_enable_habit_completions_realtime.sql's pattern.
-- No REPLICA IDENTITY change needed here: only UPDATE events are consumed
-- (see HabitRealtimeService), and Postgres always includes the full NEW row
-- on an UPDATE regardless of replica identity — that setting only affects
-- what's available on the OLD side, which this doesn't need.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'user_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
    END IF;
END $$;
