-- Fix dividend system issues
-- 1. First, create the missing stock_dividend_distributions table
CREATE TABLE IF NOT EXISTS stock_dividend_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dividend_payment_id UUID REFERENCES dividend_payments(id) ON DELETE CASCADE,
    stockholder_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    shares_owned INTEGER NOT NULL,
    dividend_per_share NUMERIC(10, 4) NOT NULL,
    total_dividend NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Fix the ambiguous column reference in process_habit_completion_dividends
DROP FUNCTION IF EXISTS process_habit_completion_dividends(UUID);
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(completion_uuid UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE habit_business_uuid UUID;
business_owner_id UUID;
stock_uuid UUID;
base_earnings NUMERIC;
stock_boost NUMERIC := 0;
total_dividend_pool NUMERIC;
dividend_payment_uuid UUID;
stockholder RECORD;
dividend_per_share NUMERIC;
stockholder_dividend NUMERIC;
shares_owned_by_owner INTEGER;
total_shares_issued INTEGER;
shares_owned_by_others INTEGER;
other_ownership_percentage NUMERIC;
stock_boost_percentage NUMERIC;
BEGIN -- Get completion details
SELECT habit_business_id,
    user_id,
    earnings INTO habit_business_uuid,
    business_owner_id,
    base_earnings
FROM habit_completions
WHERE id = completion_uuid;
-- Get stock details with explicit table aliases
SELECT bs.id,
    bs.shares_owned_by_owner,
    bs.total_shares_issued INTO stock_uuid,
    shares_owned_by_owner,
    total_shares_issued
FROM business_stocks bs
WHERE bs.habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN;
-- No stock exists for this business
END IF;
-- Calculate stock boost: 5% bonus per 10% of shares owned by others
shares_owned_by_others := total_shares_issued - shares_owned_by_owner;
other_ownership_percentage := (
    shares_owned_by_others::NUMERIC / total_shares_issued::NUMERIC
) * 100;
stock_boost_percentage := FLOOR(other_ownership_percentage / 10) * 5;
stock_boost := base_earnings * (stock_boost_percentage / 100);
-- Calculate dividend pool (50% of stock boost goes to dividends)
total_dividend_pool := stock_boost * 0.5;
IF total_dividend_pool <= 0 THEN RETURN;
-- No dividends to distribute
END IF;
-- Record dividend payment and get the ID
INSERT INTO dividend_payments (
        stock_id,
        habit_completion_id,
        business_owner_id,
        base_earnings,
        stock_boost_amount,
        total_dividend_pool
    )
VALUES (
        stock_uuid,
        completion_uuid,
        business_owner_id,
        base_earnings,
        stock_boost,
        total_dividend_pool
    )
RETURNING id INTO dividend_payment_uuid;
-- Get total shares owned by external investors (excluding owner)
SELECT COALESCE(SUM(sh.shares_owned), 0) INTO dividend_per_share
FROM stock_holdings sh
WHERE sh.stock_id = stock_uuid;
IF dividend_per_share > 0 THEN dividend_per_share := total_dividend_pool / dividend_per_share;
-- Distribute dividends to stockholders
FOR stockholder IN
SELECT sh.holder_id,
    sh.shares_owned
FROM stock_holdings sh
WHERE sh.stock_id = stock_uuid
    AND sh.shares_owned > 0 LOOP stockholder_dividend := stockholder.shares_owned * dividend_per_share;
-- Record dividend distribution with proper UUID
INSERT INTO stock_dividend_distributions (
        dividend_payment_id,
        stockholder_id,
        shares_owned,
        dividend_per_share,
        total_dividend
    )
VALUES (
        dividend_payment_uuid,
        stockholder.holder_id,
        stockholder.shares_owned,
        dividend_per_share,
        stockholder_dividend
    );
-- Add dividend to stockholder's cash
UPDATE user_profiles
SET cash = cash + stockholder_dividend,
    updated_at = NOW()
WHERE id = stockholder.holder_id;
-- Update total dividends earned in holding
UPDATE stock_holdings
SET total_dividends_earned = total_dividends_earned + stockholder_dividend,
    updated_at = NOW()
WHERE holder_id = stockholder.holder_id
    AND stock_id = stock_uuid;
END LOOP;
END IF;
END;
$$;
-- 3. Create the missing reset_outdated_daily_habits function
CREATE OR REPLACE FUNCTION reset_outdated_daily_habits() RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE reset_count INTEGER := 0;
BEGIN -- Reset daily habits that haven't been completed today and were last completed before today
UPDATE habit_businesses
SET current_progress = 0,
    last_completed_at = NULL,
    updated_at = NOW()
WHERE frequency = 'daily'
    AND is_active = true
    AND (
        last_completed_at IS NULL
        OR DATE(last_completed_at AT TIME ZONE 'UTC') < CURRENT_DATE
    )
    AND current_progress > 0;
GET DIAGNOSTICS reset_count = ROW_COUNT;
RETURN reset_count;
END;
$$;
-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_outdated_daily_habits() TO authenticated;
-- 5. Grant table permissions
GRANT ALL ON stock_dividend_distributions TO authenticated;