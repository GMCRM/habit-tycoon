-- Comprehensive Stocks System SQL Functions
-- These functions implement the full stocks feature with dividends, purchases, and pokes
-- Function to create initial stocks for a habit business when it's created
DROP FUNCTION IF EXISTS create_business_stock(UUID);
CREATE OR REPLACE FUNCTION create_business_stock(habit_business_uuid UUID) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE stock_uuid UUID;
business_owner UUID;
base_stock_price NUMERIC;
BEGIN -- Get the business owner and calculate base stock price
SELECT user_id,
    earnings_per_completion INTO business_owner,
    base_stock_price
FROM habit_businesses
WHERE id = habit_business_uuid;
IF business_owner IS NULL THEN RAISE EXCEPTION 'Habit business not found';
END IF;
-- Create business stock entry
INSERT INTO business_stocks (
        habit_business_id,
        business_owner_id,
        current_stock_price,
        total_shares_issued,
        shares_owned_by_owner,
        shares_available,
        price_multiplier,
        last_price_update
    )
VALUES (
        habit_business_uuid,
        business_owner,
        COALESCE(base_stock_price, 1),
        -- Use earnings_per_completion or $1 default (never higher)
        100,
        -- Issue 100 shares
        80,
        -- Owner keeps 80 shares (80%)
        20,
        -- 20 shares available for purchase (20%)
        1.0,
        -- Base price multiplier
        NOW()
    )
RETURNING id INTO stock_uuid;
-- Update the stock price based on current streak
PERFORM update_stock_price_by_streak(habit_business_uuid);
RETURN stock_uuid;
END;
$$;
-- Function to get friend businesses available for stock purchase
DROP FUNCTION IF EXISTS get_friend_businesses_for_stocks(UUID);
CREATE OR REPLACE FUNCTION get_friend_businesses_for_stocks(user_uuid UUID) RETURNS TABLE (
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_id UUID,
        owner_name TEXT,
        streak INTEGER,
        frequency TEXT,
        goal_value INTEGER,
        current_progress INTEGER,
        earnings_per_completion NUMERIC,
        stock_id UUID,
        stock_price NUMERIC,
        base_price NUMERIC,
        price_multiplier NUMERIC,
        shares_available INTEGER,
        total_shares INTEGER,
        potential_dividend NUMERIC
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT hb.id,
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    hb.user_id,
    up.name,
    hb.streak,
    hb.frequency,
    hb.goal_value,
    hb.current_progress,
    hb.earnings_per_completion,
    bs.id as stock_id,
    COALESCE(
        bs.current_stock_price,
        COALESCE(hb.earnings_per_completion, 1) * COALESCE(bs.price_multiplier, 1)
    ) as stock_price,
    COALESCE(hb.earnings_per_completion, 1) as base_price,
    bs.price_multiplier,
    bs.shares_available,
    bs.total_shares_issued,
    -- Calculate potential dividend per share: (base dividend * streak multiplier * progress bonus) / total shares
    ROUND(
        (
            (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * CASE
                WHEN hb.current_progress >= hb.goal_value THEN 1.5
                ELSE 1
            END
        ) / COALESCE(bs.total_shares_issued, 100),
        2
    ) as potential_dividend
FROM habit_businesses hb
    INNER JOIN user_profiles up ON hb.user_id = up.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id -- Add join for business type
    LEFT JOIN business_stocks bs ON hb.id = bs.habit_business_id
    INNER JOIN friendships f ON (
        f.user_id = user_uuid
        AND f.friend_id = hb.user_id
    )
    OR (
        f.friend_id = user_uuid
        AND f.user_id = hb.user_id
    )
WHERE hb.is_active = true
    AND hb.user_id != user_uuid -- Don't show user's own businesses
    AND f.status = 'accepted' -- Only friends
    AND (
        bs.shares_available > 0
        OR bs.shares_available IS NULL
    ) -- Available shares or no stock created yet
ORDER BY hb.streak DESC,
    hb.business_name;
END;
$$;
-- Function to get user's stock portfolio
DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_name TEXT,
        shares_owned INTEGER,
        average_purchase_price NUMERIC,
        current_stock_price NUMERIC,
        total_invested NUMERIC,
        current_value NUMERIC,
        profit_loss NUMERIC,
        total_dividends_earned NUMERIC,
        daily_dividend_rate NUMERIC,
        business_streak INTEGER
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    -- Calculate daily dividend rate: 100% of earnings per completion * streak multiplier * ownership percentage
    ROUND(
        (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * (
            sh.shares_owned::NUMERIC / bs.total_shares_issued::NUMERIC
        ),
        2
    ) as daily_dividend_rate,
    hb.streak
FROM stock_holdings sh
    INNER JOIN business_stocks bs ON sh.stock_id = bs.id
    INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id
    INNER JOIN user_profiles up ON hb.user_id = up.id
WHERE sh.holder_id = user_uuid
    AND sh.shares_owned > 0
    AND hb.is_active = true
ORDER BY current_value DESC;
END;
$$;
-- Function to purchase stock shares
DROP FUNCTION IF EXISTS purchase_stock_shares(UUID, UUID, INTEGER);
CREATE OR REPLACE FUNCTION purchase_stock_shares(
        buyer_id UUID,
        stock_uuid UUID,
        shares_to_buy INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE stock_price NUMERIC;
available_shares INTEGER;
total_cost NUMERIC;
buyer_cash NUMERIC;
existing_holding_id UUID;
new_total_shares INTEGER;
new_total_invested NUMERIC;
new_avg_price NUMERIC;
BEGIN -- Get stock details
SELECT business_stocks.current_stock_price,
    business_stocks.shares_available INTO stock_price,
    available_shares
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
IF stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Check if enough shares are available
IF available_shares < shares_to_buy THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Not enough shares available'
);
END IF;
-- Calculate total cost
total_cost := stock_price * shares_to_buy;
-- Check buyer's cash
SELECT cash INTO buyer_cash
FROM user_profiles
WHERE id = buyer_id;
IF buyer_cash < total_cost THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
END IF;
-- Check if user already has holdings in this stock
SELECT id INTO existing_holding_id
FROM stock_holdings
WHERE holder_id = buyer_id
    AND stock_id = stock_uuid;
IF existing_holding_id IS NOT NULL THEN -- Update existing holding
SELECT shares_owned + shares_to_buy,
    total_invested + total_cost INTO new_total_shares,
    new_total_invested
FROM stock_holdings
WHERE id = existing_holding_id;
new_avg_price := new_total_invested / new_total_shares;
UPDATE stock_holdings
SET shares_owned = new_total_shares,
    average_purchase_price = new_avg_price,
    total_invested = new_total_invested,
    updated_at = NOW()
WHERE id = existing_holding_id;
ELSE -- Create new holding
INSERT INTO stock_holdings (
        holder_id,
        stock_id,
        shares_owned,
        average_purchase_price,
        total_invested,
        total_dividends_earned
    )
VALUES (
        buyer_id,
        stock_uuid,
        shares_to_buy,
        stock_price,
        total_cost,
        0
    );
END IF;
-- Update stock availability
UPDATE business_stocks
SET shares_available = business_stocks.shares_available - shares_to_buy,
    updated_at = NOW()
WHERE business_stocks.id = stock_uuid;
-- Record transaction
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        buyer_id,
        NULL,
        -- IPO purchase, no seller
        shares_to_buy,
        stock_price,
        total_cost,
        'purchase'
    );
-- Deduct cash from buyer
UPDATE user_profiles
SET cash = cash - total_cost,
    updated_at = NOW()
WHERE id = buyer_id;
RETURN jsonb_build_object(
    'success',
    true,
    'shares_purchased',
    shares_to_buy,
    'total_cost',
    total_cost,
    'new_cash_balance',
    buyer_cash - total_cost
);
END;
$$;
-- Function to send a habit poke
DROP FUNCTION IF EXISTS send_habit_poke(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION send_habit_poke(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE from_user_name TEXT;
BEGIN -- Get sender's name
SELECT name INTO from_user_name
FROM user_profiles
WHERE id = from_user_id;
IF from_user_name IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
END IF;
-- Create poke record
INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
VALUES (
        from_user_id,
        to_user_id,
        from_user_name || ' is rooting for your ' || business_name || ' habit! 👋',
        'habit_reminder',
        false,
        jsonb_build_object('business_name', business_name)
    );
RETURN jsonb_build_object(
    'success',
    true,
    'message',
    'Poke sent successfully'
);
END;
$$;
-- Function to send a stockholder reminder
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Create stockholder reminder record
INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
VALUES (
        from_user_id,
        to_user_id,
        from_user_name || ' sent you a friendly reminder to do "' || business_name || '" because they own stocks in your business! 📈💰',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name',
            business_name,
            'investor_name',
            from_user_name
        )
    );
RETURN jsonb_build_object(
    'success',
    true,
    'message',
    'Stockholder reminder sent successfully'
);
END;
$$;
-- Function to process dividend payments when habits are completed
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
-- Get stock details
SELECT id,
    shares_owned_by_owner,
    total_shares_issued INTO stock_uuid,
    shares_owned_by_owner,
    total_shares_issued
FROM business_stocks
WHERE habit_business_id = habit_business_uuid;
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
SELECT COALESCE(SUM(shares_owned), 0) INTO dividend_per_share
FROM stock_holdings
WHERE stock_id = stock_uuid;
IF dividend_per_share > 0 THEN dividend_per_share := total_dividend_pool / dividend_per_share;
-- Distribute dividends to stockholders
FOR stockholder IN
SELECT holder_id,
    shares_owned
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0 LOOP stockholder_dividend := stockholder.shares_owned * dividend_per_share;
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
END IF;
END;
$$;
-- Function to get user's social pokes/notifications
DROP FUNCTION IF EXISTS get_user_social_notifications(UUID);
CREATE OR REPLACE FUNCTION get_user_social_notifications(user_uuid UUID) RETURNS TABLE (
        poke_id UUID,
        from_user_name TEXT,
        from_user_avatar TEXT,
        message TEXT,
        poke_type TEXT,
        is_read BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        business_name TEXT
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT sp.id,
    up.name,
    up.avatar_url,
    sp.message,
    sp.type,
    sp.is_read,
    sp.created_at,
    (sp.metadata->>'business_name')::TEXT
FROM social_pokes sp
    INNER JOIN user_profiles up ON sp.from_user_id = up.id
WHERE sp.to_user_id = user_uuid
ORDER BY sp.created_at DESC
LIMIT 50;
END;
$$;
-- Function to update stock price based on habit streak
DROP FUNCTION IF EXISTS update_stock_price_by_streak(UUID);
CREATE OR REPLACE FUNCTION update_stock_price_by_streak(habit_business_uuid UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE current_streak INTEGER;
base_earnings NUMERIC;
base_price NUMERIC;
streak_multiplier NUMERIC;
new_price NUMERIC;
stock_uuid UUID;
BEGIN -- Get current streak and base earnings
SELECT streak,
    earnings_per_completion INTO current_streak,
    base_earnings
FROM habit_businesses
WHERE id = habit_business_uuid;
IF current_streak IS NULL THEN RAISE EXCEPTION 'Habit business not found';
END IF;
-- Get stock ID
SELECT id INTO stock_uuid
FROM business_stocks
WHERE habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN 0;
-- No stock exists
END IF;
-- Calculate base price (earnings as baseline, not * 100)
base_price := COALESCE(base_earnings, 1);
-- Calculate streak multiplier: 
-- Streak 0-1: 1.0x (base price)
-- Streak 2-7: 1.0x to 1.5x (gradual increase)
-- Streak 8-14: 1.5x to 2.0x 
-- Streak 15-30: 2.0x to 3.0x
-- Streak 31+: 3.0x to 5.0x (capped)
IF current_streak <= 1 THEN streak_multiplier := 1.0;
ELSIF current_streak <= 7 THEN streak_multiplier := 1.0 + (current_streak - 1) * 0.083;
-- +8.3% per day up to 50%
ELSIF current_streak <= 14 THEN streak_multiplier := 1.5 + (current_streak - 7) * 0.071;
-- +7.1% per day up to 100%
ELSIF current_streak <= 30 THEN streak_multiplier := 2.0 + (current_streak - 14) * 0.0625;
-- +6.25% per day up to 200%
ELSE streak_multiplier := 3.0 + LEAST((current_streak - 30) * 0.05, 2.0);
-- +5% per day, capped at 5x total
END IF;
-- Calculate new price
new_price := ROUND(base_price * streak_multiplier, 2);
-- Update stock price
UPDATE business_stocks
SET current_stock_price = new_price,
    price_multiplier = streak_multiplier,
    last_price_update = NOW()
WHERE id = stock_uuid;
RETURN new_price;
END;
$$;
-- Function to sell stock shares
DROP FUNCTION IF EXISTS sell_stock_shares(UUID, UUID, INTEGER);
CREATE OR REPLACE FUNCTION sell_stock_shares(
        seller_id UUID,
        stock_uuid UUID,
        shares_to_sell INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE current_stock_price NUMERIC;
holding_record RECORD;
total_sale_value NUMERIC;
capital_gains NUMERIC;
transaction_fee NUMERIC := 0.02;
-- 2% transaction fee
net_proceeds NUMERIC;
BEGIN -- Get current stock price
SELECT current_stock_price INTO current_stock_price
FROM business_stocks
WHERE id = stock_uuid;
IF current_stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Get user's holding
SELECT * INTO holding_record
FROM stock_holdings
WHERE holder_id = seller_id
    AND stock_id = stock_uuid;
IF holding_record IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'No holdings found');
END IF;
-- Check if user has enough shares to sell
IF holding_record.shares_owned < shares_to_sell THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Insufficient shares to sell'
);
END IF;
-- Calculate sale proceeds
total_sale_value := current_stock_price * shares_to_sell;
transaction_fee := total_sale_value * 0.02;
-- 2% fee
net_proceeds := total_sale_value - transaction_fee;
-- Calculate capital gains/loss
capital_gains := (
    current_stock_price - holding_record.average_purchase_price
) * shares_to_sell;
-- Update or remove holding
IF holding_record.shares_owned = shares_to_sell THEN -- Selling all shares - remove holding
DELETE FROM stock_holdings
WHERE id = holding_record.id;
ELSE -- Partial sale - update holding
UPDATE stock_holdings
SET shares_owned = shares_owned - shares_to_sell,
    total_invested = total_invested - (
        holding_record.average_purchase_price * shares_to_sell
    ),
    updated_at = NOW()
WHERE id = holding_record.id;
END IF;
-- Update stock availability (shares go back to available pool)
UPDATE business_stocks
SET shares_available = shares_available + shares_to_sell,
    updated_at = NOW()
WHERE id = stock_uuid;
-- Record the transaction
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        NULL,
        -- No specific buyer (back to market)
        seller_id,
        shares_to_sell,
        current_stock_price,
        total_sale_value,
        'sale'
    );
-- Add proceeds to seller's cash
UPDATE user_profiles
SET cash = cash + net_proceeds,
    updated_at = NOW()
WHERE id = seller_id;
RETURN jsonb_build_object(
    'success',
    true,
    'shares_sold',
    shares_to_sell,
    'sale_price_per_share',
    current_stock_price,
    'total_sale_value',
    total_sale_value,
    'transaction_fee',
    transaction_fee,
    'net_proceeds',
    net_proceeds,
    'capital_gains',
    capital_gains
);
END;
$$;
-- Grant permissions
GRANT EXECUTE ON FUNCTION create_business_stock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_stock_shares(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION send_habit_poke(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_social_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_stock_price_by_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sell_stock_shares(UUID, UUID, INTEGER) TO authenticated;