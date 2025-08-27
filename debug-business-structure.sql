-- Check how business names and owner names should be retrieved
-- 1. Check habit_businesses table structure
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'habit_businesses'
ORDER BY ordinal_position;
-- 2. Check if there's a separate businesses table
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE '%business%';
-- 3. Check user_profiles structure to get proper column names
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
-- 4. Sample data to see the relationship
SELECT hb.id as habit_business_id,
    hb.business_name as habit_name,
    hb.user_id as owner_id,
    bs.id as stock_id
FROM habit_businesses hb
    JOIN business_stocks bs ON hb.id = bs.habit_business_id
LIMIT 5;