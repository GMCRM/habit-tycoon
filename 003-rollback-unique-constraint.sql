-- ROLLBACK: Remove unique constraint that blocks multiple daily completions
-- Some habits are designed to be completed multiple times per day
-- (e.g., "Take 5 pills per day" = 5 completions, "Drink 8 glasses of water" = 8 completions)

-- Drop the unique constraint
DROP INDEX IF EXISTS idx_unique_daily_completion;

-- Keep the performance indexes (they're still useful)
-- Keep the immutable function (might be useful later)

COMMENT ON FUNCTION extract_date_utc IS 'Immutable function for extracting date from timestamptz - kept for potential future use';
