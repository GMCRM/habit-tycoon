-- Debug stock share availability issue
-- First, let's see the current state of all stocks
SELECT hb.business_name,
    hb.user_id as owner_id,
    up.name as owner_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available,
    -- Calculate what shares_available SHOULD be
    (
        bs.total_shares_issued - bs.shares_owned_by_owner
    ) as should_be_available,
    -- Check if there's a mismatch
    CASE
        WHEN bs.shares_available != (
            bs.total_shares_issued - bs.shares_owned_by_owner
        ) THEN 'MISMATCH!'
        ELSE 'OK'
    END as status
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    JOIN user_profiles up ON hb.user_id = up.id
ORDER BY hb.business_name;
-- Now let's see how many shares have actually been purchased by investors
SELECT hb.business_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available,
    COALESCE(SUM(sh.shares_owned), 0) as shares_purchased_by_investors,
    -- What shares_available should actually be
    (
        bs.total_shares_issued - bs.shares_owned_by_owner - COALESCE(SUM(sh.shares_owned), 0)
    ) as correct_available
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    LEFT JOIN stock_holdings sh ON bs.id = sh.stock_id
GROUP BY hb.business_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available
ORDER BY hb.business_name;
-- Fix the shares_available calculation
UPDATE business_stocks
SET shares_available = (
        total_shares_issued - shares_owned_by_owner - COALESCE(
            (
                SELECT SUM(shares_owned)
                FROM stock_holdings
                WHERE stock_id = business_stocks.id
            ),
            0
        )
    )
WHERE shares_available != (
        total_shares_issued - shares_owned_by_owner - COALESCE(
            (
                SELECT SUM(shares_owned)
                FROM stock_holdings
                WHERE stock_id = business_stocks.id
            ),
            0
        )
    );
-- Verify the fix
SELECT hb.business_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    COALESCE(SUM(sh.shares_owned), 0) as shares_sold_to_investors,
    bs.shares_available as available_shares,
    -- Verify the math: total = owner + sold + available
    (
        bs.shares_owned_by_owner + COALESCE(SUM(sh.shares_owned), 0) + bs.shares_available
    ) as total_check
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    LEFT JOIN stock_holdings sh ON bs.id = sh.stock_id
GROUP BY hb.business_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available
ORDER BY hb.business_name;