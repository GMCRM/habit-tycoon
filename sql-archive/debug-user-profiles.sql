-- Check the structure of user_profiles table
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
-- Check some sample data
SELECT *
FROM user_profiles
LIMIT 5;