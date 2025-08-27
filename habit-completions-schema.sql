-- Create habit_completions table to track each habit completion
-- This stores the completion history with earnings and streak data
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
    streak_count INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_business_id ON habit_completions(habit_business_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON habit_completions(completed_at);
-- Enable RLS (Row Level Security)
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own completions" ON habit_completions;
CREATE POLICY "Users can view their own completions" ON habit_completions FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own completions" ON habit_completions;
CREATE POLICY "Users can insert their own completions" ON habit_completions FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own completions" ON habit_completions;
CREATE POLICY "Users can update their own completions" ON habit_completions FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own completions" ON habit_completions;
CREATE POLICY "Users can delete their own completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);