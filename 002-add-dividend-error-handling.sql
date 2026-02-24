-- Migration: Add robust error handling to dividend calculation function
-- Prevents crashes from edge cases like division by zero or invalid data
-- Fixes: Critical dividend calculation errors reported in health check
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
total_external_shares INTEGER;
BEGIN -- Validation: Check if completion exists
IF completion_uuid IS NULL THEN RAISE WARNING 'process_habit_completion_dividends: completion_uuid is NULL';
RETURN;
END IF;
-- Get completion details
SELECT habit_business_id,
    user_id,
    earnings INTO habit_business_uuid,
    business_owner_id,
    base_earnings
FROM habit_completions
WHERE id = completion_uuid;
-- Validation: Check if completion was found
IF habit_business_uuid IS NULL THEN RAISE WARNING 'process_habit_completion_dividends: No habit completion found for UUID %',
completion_uuid;
RETURN;
END IF;
-- Validation: Check earnings is valid
IF base_earnings IS NULL
OR base_earnings <= 0 THEN RAISE WARNING 'process_habit_completion_dividends: Invalid base_earnings % for completion %',
base_earnings,
completion_uuid;
RETURN;
END IF;
-- Get stock details
SELECT bs.id,
    bs.shares_owned_by_owner,
    bs.total_shares_issued INTO stock_uuid,
    shares_owned_by_owner,
    total_shares_issued
FROM business_stocks bs
WHERE bs.habit_business_id = habit_business_uuid;
-- If no stock exists, that's OK - just return
IF stock_uuid IS NULL THEN RETURN;
END IF;
-- Validation: Check share counts are valid
IF total_shares_issued IS NULL
OR total_shares_issued <= 0 THEN RAISE WARNING 'process_habit_completion_dividends: Invalid total_shares_issued % for stock %',
total_shares_issued,
stock_uuid;
RETURN;
END IF;
IF shares_owned_by_owner IS NULL
OR shares_owned_by_owner < 0 THEN RAISE WARNING 'process_habit_completion_dividends: Invalid shares_owned_by_owner % for stock %',
shares_owned_by_owner,
stock_uuid;
RETURN;
END IF;
IF shares_owned_by_owner > total_shares_issued THEN RAISE WARNING 'process_habit_completion_dividends: Owner shares % exceeds total shares % for stock %',
shares_owned_by_owner,
total_shares_issued,
stock_uuid;
RETURN;
END IF;
-- Calculate stock boost: 5% bonus per 10% of shares owned by others
shares_owned_by_others := total_shares_issued - shares_owned_by_owner;
-- If no external shares, no dividends needed
IF shares_owned_by_others <= 0 THEN RETURN;
END IF;
other_ownership_percentage := (
    shares_owned_by_others::NUMERIC / total_shares_issued::NUMERIC
) * 100;
stock_boost_percentage := FLOOR(other_ownership_percentage / 10) * 5;
stock_boost := base_earnings * (stock_boost_percentage / 100);
-- Calculate dividend pool (50% of stock boost goes to dividends)
total_dividend_pool := stock_boost * 0.5;
-- If dividend pool is too small, don't bother
IF total_dividend_pool <= 0 THEN RETURN;
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
-- Get total shares owned by external investors
SELECT COALESCE(SUM(shares_owned), 0) INTO total_external_shares
FROM stock_holdings
WHERE stock_id = stock_uuid;
-- Validation: Make sure we have shares to distribute to
IF total_external_shares IS NULL
OR total_external_shares <= 0 THEN RAISE WARNING 'process_habit_completion_dividends: No external shares found for stock % despite shares_owned_by_others=%',
stock_uuid,
shares_owned_by_others;
RETURN;
END IF;
-- Calculate dividend per share (safe now - we know total_external_shares > 0)
dividend_per_share := total_dividend_pool / total_external_shares;
-- Distribute dividends to stockholders
FOR stockholder IN
SELECT holder_id,
    shares_owned
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0 LOOP -- Validation: Skip invalid holdings
    IF stockholder.shares_owned IS NULL
    OR stockholder.shares_owned <= 0 THEN CONTINUE;
END IF;
stockholder_dividend := stockholder.shares_owned * dividend_per_share;
-- Skip if dividend is negligible
IF stockholder_dividend <= 0 THEN CONTINUE;
END IF;
-- Record dividend distribution
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
EXCEPTION
WHEN OTHERS THEN -- Log the error but don't crash the transaction
RAISE WARNING 'process_habit_completion_dividends: Unexpected error for completion %: %',
completion_uuid,
SQLERRM;
-- Re-raise if it's a serious error that should abort
IF SQLSTATE NOT IN ('23505', '23503') THEN -- Not a duplicate/constraint violation
RAISE;
END IF;
END;
$$;
-- Grant permissions
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;
-- Add comment for documentation
COMMENT ON FUNCTION process_habit_completion_dividends(UUID) IS 'Processes dividend payments to stockholders when a habit business owner completes a habit. 
Includes comprehensive error handling to prevent crashes from edge cases.
Returns silently if no dividends need to be paid (e.g., no external investors).';