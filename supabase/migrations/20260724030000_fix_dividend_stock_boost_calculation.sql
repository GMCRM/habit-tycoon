-- ─── process_habit_completion_dividends: dividend pool must reflect ACTUAL shares
-- purchased by investors ───
--
-- Previously "shares owned by others" was computed as
-- (total_shares_issued - shares_owned_by_owner), which is a constant (20) because
-- shares_owned_by_owner never changes when shares are bought/sold (only
-- shares_available does). That meant a single share purchase paid dividends as if
-- all 20 tradeable shares had sold — the same bug just fixed on the owner's side of
-- the pay boost (each purchased share now adds exactly 1% to base pay).
--
-- The completion-recording client (habit-business.service.ts) already computes the
-- exact stock-boost dollar amount using the corrected per-share formula, so it's
-- passed straight through as p_stock_boost_amount — no need to re-derive an
-- approximation here. A share-count fallback (using the corrected formula) covers
-- any caller that invokes the RPC without it.
DROP FUNCTION IF EXISTS process_habit_completion_dividends(UUID);
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(completion_uuid UUID, p_stock_boost_amount NUMERIC DEFAULT NULL) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
shares_available INTEGER;
total_shares_issued INTEGER;
shares_sold_to_investors INTEGER;
stock_boost_percentage NUMERIC;
holder_count INTEGER;
BEGIN -- Get completion details
SELECT habit_business_id,
    user_id,
    earnings INTO habit_business_uuid,
    business_owner_id,
    base_earnings
FROM habit_completions
WHERE id = completion_uuid;
-- Get stock details
SELECT bs.id,
    bs.shares_owned_by_owner,
    bs.shares_available,
    bs.total_shares_issued INTO stock_uuid,
    shares_owned_by_owner,
    shares_available,
    total_shares_issued
FROM business_stocks bs
WHERE bs.habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN;
-- No stock exists for this business
END IF;
-- How many external stockholders are there?
SELECT COUNT(*) INTO holder_count
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0;
IF holder_count = 0 THEN RETURN;
-- No stockholders, nothing to pay
END IF;
IF p_stock_boost_amount IS NOT NULL THEN
    -- Use the exact dollar boost already computed by the caller
    stock_boost := GREATEST(p_stock_boost_amount, 0);
ELSE
    -- Fallback: 1% of base pay per tradeable share actually purchased by investors
    shares_sold_to_investors := (total_shares_issued - shares_owned_by_owner) - shares_available;
    stock_boost_percentage := GREATEST(shares_sold_to_investors, 0);
    stock_boost := base_earnings * (stock_boost_percentage / 100);
END IF;
-- Dividend pool (may be 0 when no shares are sold yet — minimums will still apply)
total_dividend_pool := stock_boost * 0.5;
-- Record the dividend payment event
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
-- Compute per-share rate (may be 0; minimum will be enforced per stockholder)
SELECT COALESCE(SUM(shares_owned), 0) INTO dividend_per_share
FROM stock_holdings
WHERE stock_id = stock_uuid;
IF dividend_per_share > 0 THEN dividend_per_share := total_dividend_pool / dividend_per_share;
ELSE dividend_per_share := 0;
END IF;
FOR stockholder IN
SELECT holder_id,
    shares_owned
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0 LOOP stockholder_dividend := stockholder.shares_owned * dividend_per_share;
-- Always pay at least $0.01 per stockholder per completion
stockholder_dividend := GREATEST(stockholder_dividend, 0.01);
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
UPDATE user_profiles
SET cash = cash + stockholder_dividend,
    updated_at = NOW()
WHERE id = stockholder.holder_id;
PERFORM recalculate_net_worth(stockholder.holder_id);
UPDATE stock_holdings
SET total_dividends_earned = total_dividends_earned + stockholder_dividend,
    updated_at = NOW()
WHERE holder_id = stockholder.holder_id
    AND stock_id = stock_uuid;
END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID, NUMERIC) TO authenticated;
