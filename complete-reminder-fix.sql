-- Complete fix for stockholder reminder system
-- Run this entire script in your Supabase SQL Editor
-- First, ensure the social_pokes table exists
CREATE TABLE IF NOT EXISTS social_pokes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'poke',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_pokes_to_user ON social_pokes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_social_pokes_from_user ON social_pokes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_social_pokes_type ON social_pokes(type);
CREATE INDEX IF NOT EXISTS idx_social_pokes_created_at ON social_pokes(created_at);
-- Enable RLS
ALTER TABLE social_pokes ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own pokes" ON social_pokes;
CREATE POLICY "Users can view their own pokes" ON social_pokes FOR
SELECT USING (
        auth.uid() = to_user_id
        OR auth.uid() = from_user_id
    );
DROP POLICY IF EXISTS "Users can insert pokes" ON social_pokes;
CREATE POLICY "Users can insert pokes" ON social_pokes FOR
INSERT WITH CHECK (auth.uid() = from_user_id);
DROP POLICY IF EXISTS "Users can update their received pokes" ON social_pokes;
CREATE POLICY "Users can update their received pokes" ON social_pokes FOR
UPDATE USING (auth.uid() = to_user_id);
-- Now create the stockholder reminder function
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Insert the reminder into social_pokes
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
        from_user_name || ' sent you a friendly reminder to complete "' || business_name || '" because they own shares in your business! 📈💰',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name',
            business_name,
            'investor_name',
            from_user_name
        )
    );
-- Return success
RETURN jsonb_build_object(
    'success',
    true,
    'message',
    'Stockholder reminder sent successfully'
);
END;
$$;
-- Grant permissions
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;
-- Also update the portfolio function to include owner_id
DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_name TEXT,
        owner_id UUID,
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
    hb.business_icon,
    up.name,
    hb.user_id as owner_id,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    ROUND(
        (
            hb.earnings_per_completion * 0.10 * GREATEST(hb.streak, 1)
        ) * sh.shares_owned,
        2
    ) as daily_dividend_rate,
    hb.streak as business_streak
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.business_id = hb.id
    JOIN business_types bt ON hb.business_type_id = bt.id
    JOIN user_profiles up ON hb.user_id = up.user_id
WHERE sh.user_id = user_uuid
    AND sh.shares_owned > 0
ORDER BY sh.total_invested DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;