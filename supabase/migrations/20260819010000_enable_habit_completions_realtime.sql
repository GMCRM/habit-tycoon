-- Enable Supabase Realtime on habit_completions so a completion/undo made on
-- one device is pushed live to any other signed-in device/session, instead
-- of only becoming visible on that other device's next manual refresh
-- (navigation, pull-to-refresh, app restart).
--
-- REPLICA IDENTITY FULL is required so DELETE events (undo) carry the full
-- old row (habit_business_id, completed_at) — by default Postgres only
-- includes the primary key (id) in a DELETE's old record, which isn't
-- enough for the client to know which habit/date to revert.
ALTER TABLE habit_completions REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'habit_completions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE habit_completions;
    END IF;
END $$;
