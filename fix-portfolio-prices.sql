-- Fix inflated portfolio holdings from the old pricing system
-- First, let's see what we're working with
SELECT hb.business_name,
    sh.shares_owned,
    sh.average_purchase_price,
    sh.total_invested,
    bs.current_stock_price,
    hb.earnings_per_completion
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
WHERE sh.average_purchase_price > 10;
-- Show inflated holdings
-- Fix the inflated holdings by adjusting them to reasonable prices
-- New logic: if you paid $100+ for a $1 stock, adjust proportionally
UPDATE stock_holdings
SET average_purchase_price = (
        SELECT hb.earnings_per_completion
        FROM business_stocks bs
            JOIN habit_businesses hb ON bs.habit_business_id = hb.id
        WHERE bs.id = stock_holdings.stock_id
    ),
    total_invested = shares_owned * (
        SELECT hb.earnings_per_completion
        FROM business_stocks bs
            JOIN habit_businesses hb ON bs.habit_business_id = hb.id
        WHERE bs.id = stock_holdings.stock_id
    )
WHERE average_purchase_price > 10;
-- Only fix the inflated ones
-- Verify the changes
SELECT hb.business_name,
    sh.shares_owned,
    sh.average_purchase_price,
    sh.total_invested,
    bs.current_stock_price,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (
        (sh.shares_owned * bs.current_stock_price) - sh.total_invested
    ) as profit_loss
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
ORDER BY hb.business_name;