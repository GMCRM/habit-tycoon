-- Add display ordering fields to habit_businesses table
-- This allows users to customize the order of their habit cards

-- Add display_order column for current display order (changes when habits are completed)
ALTER TABLE habit_businesses 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add user_custom_order column to store user's preferred order (for resetting)
ALTER TABLE habit_businesses 
ADD COLUMN IF NOT EXISTS user_custom_order INTEGER DEFAULT 0;

-- Initialize display_order and user_custom_order for existing records
-- Order by created_at (oldest first) to maintain consistent ordering
UPDATE habit_businesses 
SET display_order = subquery.row_number,
    user_custom_order = subquery.row_number
FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
    FROM habit_businesses 
    WHERE display_order = 0
) AS subquery
WHERE habit_businesses.id = subquery.id;

-- Create index for better performance on ordering queries
CREATE INDEX IF NOT EXISTS idx_habit_businesses_display_order 
ON habit_businesses(user_id, display_order);

-- Create index for user_custom_order as well
CREATE INDEX IF NOT EXISTS idx_habit_businesses_user_custom_order 
ON habit_businesses(user_id, user_custom_order);