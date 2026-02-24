-- Migration: Add unique constraint to prevent duplicate habit completions
-- This ensures a user can only complete each habit once per day
-- Fixes: Duplicate completion bug reported in health check

-- First, create an immutable function to extract the date from a timestamp
-- This is required because ::date cast is timezone-dependent and not immutable
CREATE OR REPLACE FUNCTION extract_date_utc(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT (ts AT TIME ZONE 'UTC')::date;
$$;

-- Add unique index that prevents duplicate completions for the same habit on the same day
-- Uses the immutable function to extract date portion for timezone-safe date matching
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_completion 
ON habit_completions(
    habit_business_id, 
    user_id, 
    extract_date_utc(completed_at)
);

-- Add index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id 
ON habit_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_business_id 
ON habit_completions(habit_business_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at 
ON habit_completions(completed_at);

-- Add indexes for stock-related queries
CREATE INDEX IF NOT EXISTS idx_stockholders_user_id 
ON stockholders(user_id) 
WHERE stockholders IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stockholders_stock_id 
ON stockholders(stock_id) 
WHERE stockholders IS NOT NULL;

-- Add indexes for stock holdings
CREATE INDEX IF NOT EXISTS idx_stock_holdings_holder_id 
ON stock_holdings(holder_id);

CREATE INDEX IF NOT EXISTS idx_stock_holdings_stock_id 
ON stock_holdings(stock_id);

-- Comments for documentation
COMMENT ON INDEX idx_unique_daily_completion IS 
'Prevents duplicate habit completions - a user can only complete each habit once per calendar day';

COMMENT ON INDEX idx_habit_completions_user_id IS 
'Performance index for querying user completions';

COMMENT ON INDEX idx_habit_completions_habit_business_id IS 
'Performance index for querying completions by habit business';

COMMENT ON INDEX idx_habit_completions_completed_at IS 
'Performance index for date-range queries on completions';
