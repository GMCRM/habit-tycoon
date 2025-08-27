-- Check current stock data
SELECT bs.id as stock_id,
    hb.business_name,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available,
    bs.current_stock_price
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
ORDER BY hb.business_name;
-- Update existing stocks from 1000-share system to 100-share system
UPDATE business_stocks
SET total_shares_issued = 100,
    shares_owned_by_owner = 80,
    shares_available = 20
WHERE total_shares_issued = 1000;
-- Update any existing stock holdings proportionally
-- If someone owned 50 shares out of 1000, they now own 5 shares out of 100
UPDATE stock_holdings
SET shares_owned = GREATEST(1, ROUND(shares_owned / 10)),
    total_invested = total_invested / 10,
    average_purchase_price = average_purchase_price * 10
WHERE stock_id IN (
        SELECT id
        FROM business_stocks
        WHERE total_shares_issued = 100
    );
-- Verify the changes with SIMPLE dividend calculation: 1% ownership = 1% of earnings
SELECT bs.id as stock_id,
    hb.business_name,
    hb.earnings_per_completion,
    bs.total_shares_issued,
    bs.shares_owned_by_owner,
    bs.shares_available,
    bs.current_stock_price,
    -- Simple calculation: earnings_per_completion / 100 shares = dividend per share
    -- Minimum $0.01 per share, format to exactly 2 decimal places
    TO_CHAR(
        GREATEST(
            ROUND(
                hb.earnings_per_completion / bs.total_shares_issued,
                2
            ),
            0.01
        ),
        'FM9999990.00'
    ) as expected_per_share
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
ORDER BY hb.business_name;