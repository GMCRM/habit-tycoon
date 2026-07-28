-- Lower the default starting cash/net worth for new user_profiles rows
-- from $100 to $99. Only affects the column default used as a fallback;
-- the app also passes this value explicitly on profile creation.
ALTER TABLE user_profiles ALTER COLUMN cash SET DEFAULT 99.00;
ALTER TABLE user_profiles ALTER COLUMN net_worth SET DEFAULT 99.00;
