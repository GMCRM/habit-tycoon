-- Migration: Add unique constraint to prevent duplicate habit completions
-- This ensures a user can only complete each habit once per day
-- Fixes: Duplicate completion bug reported in health check

-- Add unique index that prevents duplicate completions for the same habit on the same day
-- Uses date portion of completed_at timestamp to handle timezone-aware date matching
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_completion 
ON habit_completions(
    habit_business_id, 
    user_id, 
    (completed_at::date)
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
