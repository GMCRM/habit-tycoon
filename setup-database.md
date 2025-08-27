# Database Setup Instructions

## Step 1: Set up Business Types (10-tier progression)

Go to Supabase SQL Editor and run the contents of `business-types-seed.sql`:

```sql
-- Execute the business-types-seed.sql file content here
```

## Step 2: Set up Habit Completions Table

Go to Supabase SQL Editor and run the contents of `habit-completions-schema.sql`:

```sql
-- Execute the habit-completions-schema.sql file content here
```

## Database Connection Details

- **Supabase URL**: https://xqdzixbmnegeunjnzrla.supabase.co
- **Project**: habit-tycoon

### Tables Created:

1. **business_types** - 10-tier progression from Lemonade Stand ($10) to Oil Company ($10B)
2. **habit_completions** - Track all individual habit completions with earnings and streak data

### Features Enabled:

1. ✅ Row Level Security (RLS) policies for both tables
2. ✅ User isolation (users can only see their own data)
3. ✅ Performance indexes for efficient queries
4. ✅ Foreign key relationships to maintain data integrity

## Next Steps:

1. Execute both SQL files in Supabase SQL Editor
2. Test the EPIC 4 habit check-in system
3. Verify business type selection works in habit-business creation
4. Test streak multipliers and earnings calculations
