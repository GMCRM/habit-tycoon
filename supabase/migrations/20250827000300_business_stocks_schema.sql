-- Business Stocks and Upgrades Schema
-- This schema supports business upgrades, stock trading, and social investment features
-- Table: business_upgrades
-- Tracks when users upgrade their businesses by selling streak value
CREATE TABLE business_upgrades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    new_habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    old_business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    new_business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    streak_value_sold DECIMAL(12, 2) NOT NULL,
    -- Total value of streak when sold
    upgrade_cost DECIMAL(12, 2) NOT NULL,
    -- Cost of new business
    profit_from_upgrade DECIMAL(12, 2) NOT NULL,
    -- streak_value_sold - upgrade_cost
    old_streak_count INTEGER NOT NULL,
    -- Streak count at time of upgrade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table: business_stocks
-- Tracks stock ownership and current stock prices for each habit business
CREATE TABLE business_stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_stock_price DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    -- Current price per share
    total_shares_issued INTEGER NOT NULL DEFAULT 100,
    -- Total shares available
    shares_owned_by_owner INTEGER NOT NULL DEFAULT 100,
    -- Shares retained by business owner
    shares_available INTEGER NOT NULL DEFAULT 0,
    -- Shares available for purchase
    price_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    -- Price multiplier based on streak
    last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure shares math is correct
    CONSTRAINT valid_shares CHECK (
        shares_owned_by_owner + shares_available <= total_shares_issued
    ),
    -- Ensure one stock record per business
    CONSTRAINT unique_business_stock UNIQUE (habit_business_id)
);
-- Table: stock_transactions
-- Records all stock purchases and sales
CREATE TABLE stock_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID NOT NULL REFERENCES business_stocks(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- NULL for IPO purchases
        shares_traded INTEGER NOT NULL,
        price_per_share DECIMAL(10, 2) NOT NULL,
        total_cost DECIMAL(12, 2) NOT NULL,
        -- shares_traded * price_per_share
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'ipo')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table: stock_holdings
-- Tracks individual user stock holdings
CREATE TABLE stock_holdings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    holder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES business_stocks(id) ON DELETE CASCADE,
    shares_owned INTEGER NOT NULL DEFAULT 0,
    average_purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_invested DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_dividends_earned DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure positive shares
    CONSTRAINT positive_shares CHECK (shares_owned >= 0),
    -- One holding record per user per stock
    CONSTRAINT unique_user_stock UNIQUE (holder_id, stock_id)
);
-- Table: dividend_payments
-- Records dividend payments to stock holders
CREATE TABLE dividend_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID NOT NULL REFERENCES business_stocks(id) ON DELETE CASCADE,
    habit_completion_id UUID NOT NULL REFERENCES habit_completions(id) ON DELETE CASCADE,
    business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    base_earnings DECIMAL(10, 2) NOT NULL,
    -- Original earnings before stock boost
    stock_boost_amount DECIMAL(10, 2) NOT NULL,
    -- Additional earnings from stock ownership
    total_dividend_pool DECIMAL(10, 2) NOT NULL,
    -- Total dividends paid to all stockholders
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one dividend per completion
    CONSTRAINT unique_completion_dividend UNIQUE (habit_completion_id)
);
-- Table: stock_dividend_distributions
-- Individual dividend payments to each stockholder
CREATE TABLE stock_dividend_distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dividend_payment_id UUID NOT NULL REFERENCES dividend_payments(id) ON DELETE CASCADE,
    stockholder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shares_owned INTEGER NOT NULL,
    dividend_per_share DECIMAL(10, 4) NOT NULL,
    total_dividend DECIMAL(10, 2) NOT NULL,
    -- shares_owned * dividend_per_share
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add indexes for performance
CREATE INDEX idx_business_upgrades_user_id ON business_upgrades(user_id);
CREATE INDEX idx_business_upgrades_created_at ON business_upgrades(created_at DESC);
CREATE INDEX idx_business_stocks_habit_business_id ON business_stocks(habit_business_id);
CREATE INDEX idx_business_stocks_business_owner_id ON business_stocks(business_owner_id);
CREATE INDEX idx_stock_transactions_buyer_id ON stock_transactions(buyer_id);
CREATE INDEX idx_stock_transactions_stock_id ON stock_transactions(stock_id);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at DESC);
CREATE INDEX idx_stock_holdings_holder_id ON stock_holdings(holder_id);
CREATE INDEX idx_stock_holdings_stock_id ON stock_holdings(stock_id);
CREATE INDEX idx_dividend_payments_stock_id ON dividend_payments(stock_id);
CREATE INDEX idx_dividend_payments_business_owner_id ON dividend_payments(business_owner_id);
CREATE INDEX idx_dividend_distributions_stockholder_id ON stock_dividend_distributions(stockholder_id);
-- RLS Policies
ALTER TABLE business_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_dividend_distributions ENABLE ROW LEVEL SECURITY;
-- Business upgrades: Users can see their own upgrades
CREATE POLICY "Users can view own upgrades" ON business_upgrades FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own upgrades" ON business_upgrades FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Business stocks: Public read, owners can update
CREATE POLICY "Anyone can view business stocks" ON business_stocks FOR
SELECT USING (true);
CREATE POLICY "Business owners can update their stocks" ON business_stocks FOR
UPDATE USING (auth.uid() = business_owner_id);
CREATE POLICY "Business owners can create their stocks" ON business_stocks FOR
INSERT WITH CHECK (auth.uid() = business_owner_id);
-- Stock transactions: Users can see transactions they're involved in
CREATE POLICY "Users can view relevant transactions" ON stock_transactions FOR
SELECT USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
    );
CREATE POLICY "Users can create transactions as buyer" ON stock_transactions FOR
INSERT WITH CHECK (auth.uid() = buyer_id);
-- Stock holdings: Users can see their own holdings, business owners can see who owns their stocks
CREATE POLICY "Users can view own holdings" ON stock_holdings FOR
SELECT USING (
        auth.uid() = holder_id
        OR auth.uid() IN (
            SELECT business_owner_id
            FROM business_stocks
            WHERE business_stocks.id = stock_holdings.stock_id
        )
    );
CREATE POLICY "Users can update own holdings" ON stock_holdings FOR ALL USING (auth.uid() = holder_id);
-- Dividend payments: Business owners can create, stockholders can view
CREATE POLICY "Business owners can manage dividend payments" ON dividend_payments FOR ALL USING (auth.uid() = business_owner_id);
CREATE POLICY "Stockholders can view dividend payments" ON dividend_payments FOR
SELECT USING (
        stock_id IN (
            SELECT stock_id
            FROM stock_holdings
            WHERE holder_id = auth.uid()
                AND shares_owned > 0
        )
    );
-- Dividend distributions: Users can see their own dividends
CREATE POLICY "Users can view own dividends" ON stock_dividend_distributions FOR
SELECT USING (auth.uid() = stockholder_id);
CREATE POLICY "System can create dividend distributions" ON stock_dividend_distributions FOR
INSERT WITH CHECK (true);
-- Functions for stock price calculations
CREATE OR REPLACE FUNCTION calculate_stock_price_multiplier(streak_count INTEGER) RETURNS DECIMAL(5, 2) AS $$ BEGIN -- Stock price increases with streak, but with diminishing returns
    -- Base price at streak 1, 2x at streak 30, 5x at streak 100, 10x at streak 365
    RETURN CASE
        WHEN streak_count <= 0 THEN 0.5 -- Broken streak = lower stock price
        WHEN streak_count = 1 THEN 1.0
        WHEN streak_count <= 7 THEN 1.0 + (streak_count - 1) * 0.1 -- 1.0 to 1.6
        WHEN streak_count <= 30 THEN 1.6 + (streak_count - 7) * 0.02 -- 1.6 to 2.06
        WHEN streak_count <= 100 THEN 2.06 + (streak_count - 30) * 0.04 -- 2.06 to 4.86
        WHEN streak_count <= 365 THEN 4.86 + (streak_count - 100) * 0.02 -- 4.86 to 10.16
        ELSE 10.16 + (streak_count - 365) * 0.005 -- Slow growth after 1 year
    END;
END;
$$ LANGUAGE plpgsql;
-- Function to update stock price when streak changes
CREATE OR REPLACE FUNCTION update_stock_price_on_streak_change() RETURNS TRIGGER AS $$
DECLARE new_multiplier DECIMAL(5, 2);
base_price DECIMAL(10, 2);
BEGIN -- Calculate new price multiplier based on streak
new_multiplier := calculate_stock_price_multiplier(NEW.streak);
-- Get base price from business type
SELECT base_pay INTO base_price
FROM business_types bt
    JOIN habit_businesses hb ON bt.id = hb.business_type_id
WHERE hb.id = NEW.id;
-- Update stock price
UPDATE business_stocks
SET price_multiplier = new_multiplier,
    current_stock_price = base_price * new_multiplier,
    last_price_update = NOW(),
    updated_at = NOW()
WHERE habit_business_id = NEW.id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to update stock prices when streaks change
CREATE TRIGGER update_stock_price_trigger
AFTER
UPDATE OF streak ON habit_businesses FOR EACH ROW
    WHEN (
        OLD.streak IS DISTINCT
        FROM NEW.streak
    ) EXECUTE FUNCTION update_stock_price_on_streak_change();
-- Function to create initial stock entry when business is created
CREATE OR REPLACE FUNCTION create_initial_stock_entry() RETURNS TRIGGER AS $$
DECLARE base_price DECIMAL(10, 2);
BEGIN -- Get base price from business type
SELECT base_pay INTO base_price
FROM business_types
WHERE id = NEW.business_type_id;
-- Create initial stock entry
INSERT INTO business_stocks (
        habit_business_id,
        business_owner_id,
        current_stock_price,
        total_shares_issued,
        shares_owned_by_owner,
        shares_available,
        price_multiplier
    )
VALUES (
        NEW.id,
        NEW.user_id,
        base_price * 1.0,
        -- Start with 1x multiplier
        100,
        -- 100 total shares
        80,
        -- Owner keeps 80 shares
        20,
        -- 20 shares available for public
        1.0 -- 1x multiplier at start
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to create stock entry when business is created
CREATE TRIGGER create_stock_on_business_creation
AFTER
INSERT ON habit_businesses FOR EACH ROW EXECUTE FUNCTION create_initial_stock_entry();