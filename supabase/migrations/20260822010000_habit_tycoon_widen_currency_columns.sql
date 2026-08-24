-- Habit Tycoon (part 1/4): widen every currency column to unconstrained NUMERIC.
--
-- The new "Habit Tycoon" business tier (see the companion migrations that
-- follow this one) reuses the existing 10 business types at 100x-per-step
-- pricing starting at $10,000,000,000 — topping out around $10 octillion for
-- a maxed-out Tycoon Oil Company. Virtually every currency column in the
-- schema is a fixed DECIMAL(10,2)/DECIMAL(12,2)/DECIMAL(15,2) etc, capped
-- well below that (DECIMAL(10,2) tops out at $99,999,999.99 — already the
-- ceiling business_types.base_cost sits at today). Any of these columns
-- would raise a hard "numeric field overflow" error the moment a Tycoon-tier
-- value tried to pass through them.
--
-- Fix: widen every one of them to plain NUMERIC (Postgres's arbitrary-
-- precision type — no fixed limit), and do the same for the handful of
-- PL/pgSQL functions whose DECLARE blocks pin a local variable to one of
-- these same fixed precisions. Widening the table column is not enough on
-- its own if the function computing the value into it truncates first.
--
-- This is purely a capacity fix — no behavior changes. Every value in normal
-- (non-Tycoon) use continues to round/display exactly as it does today.

-- ─── 1. Table columns ───

ALTER TABLE user_profiles
    ALTER COLUMN cash TYPE NUMERIC,
    ALTER COLUMN net_worth TYPE NUMERIC;

ALTER TABLE business_types
    ALTER COLUMN base_cost TYPE NUMERIC,
    ALTER COLUMN base_pay TYPE NUMERIC;

ALTER TABLE habit_businesses
    ALTER COLUMN cost TYPE NUMERIC,
    ALTER COLUMN earnings_per_completion TYPE NUMERIC,
    ALTER COLUMN total_earnings TYPE NUMERIC,
    ALTER COLUMN marketplace_base_value TYPE NUMERIC;

ALTER TABLE habit_completions
    ALTER COLUMN earnings TYPE NUMERIC;

ALTER TABLE business_stocks
    ALTER COLUMN current_stock_price TYPE NUMERIC,
    ALTER COLUMN ramp_start_price TYPE NUMERIC;

ALTER TABLE stock_transactions
    ALTER COLUMN price_per_share TYPE NUMERIC,
    ALTER COLUMN total_cost TYPE NUMERIC;

ALTER TABLE stock_holdings
    ALTER COLUMN average_purchase_price TYPE NUMERIC,
    ALTER COLUMN total_invested TYPE NUMERIC,
    ALTER COLUMN total_dividends_earned TYPE NUMERIC;

ALTER TABLE dividend_payments
    ALTER COLUMN base_earnings TYPE NUMERIC,
    ALTER COLUMN stock_boost_amount TYPE NUMERIC,
    ALTER COLUMN total_dividend_pool TYPE NUMERIC;

ALTER TABLE stock_dividend_distributions
    ALTER COLUMN dividend_per_share TYPE NUMERIC,
    ALTER COLUMN total_dividend TYPE NUMERIC;

ALTER TABLE business_upgrades
    ALTER COLUMN streak_value_sold TYPE NUMERIC,
    ALTER COLUMN upgrade_cost TYPE NUMERIC,
    ALTER COLUMN profit_from_upgrade TYPE NUMERIC;

ALTER TABLE business_sales
    ALTER COLUMN sell_value TYPE NUMERIC;

ALTER TABLE joint_venture_proposals
    ALTER COLUMN total_cost TYPE NUMERIC;

ALTER TABLE joint_venture_participants
    ALTER COLUMN share_amount TYPE NUMERIC;

ALTER TABLE joint_venture_upgrade_proposals
    ALTER COLUMN total_upgrade_cost TYPE NUMERIC;

ALTER TABLE joint_venture_upgrade_participants
    ALTER COLUMN share_amount TYPE NUMERIC;

ALTER TABLE marketplace_listings
    ALTER COLUMN base_cost TYPE NUMERIC,
    ALTER COLUMN earnings_per_completion TYPE NUMERIC,
    ALTER COLUMN base_sell_value TYPE NUMERIC,
    ALTER COLUMN listing_price TYPE NUMERIC;

ALTER TABLE marketplace_purchases
    ALTER COLUMN base_cost TYPE NUMERIC,
    ALTER COLUMN earnings_per_completion TYPE NUMERIC,
    ALTER COLUMN purchase_price TYPE NUMERIC;

-- ─── 2. Functions with fixed-precision local variables/return columns ───
-- (identified by grepping every DECLARE/RETURNS TABLE in the migration
-- history for a DECIMAL(n,m)/NUMERIC(n,m) holding a cost/price/earnings
-- value; every other money-touching function already declares its locals as
-- plain NUMERIC and needs no change here)

-- update_stock_price_on_streak_change: base_price was DECIMAL(10,2), fires
-- on every streak change for every business including Tycoon-tier ones.
CREATE OR REPLACE FUNCTION update_stock_price_on_streak_change() RETURNS TRIGGER AS $$
DECLARE new_multiplier DECIMAL(5, 2);
base_price NUMERIC;
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

-- create_initial_stock_entry: base_price was DECIMAL(10,2), fires on every
-- business creation including a Tycoon-tier purchase.
CREATE OR REPLACE FUNCTION create_initial_stock_entry() RETURNS TRIGGER AS $$
DECLARE base_price NUMERIC;
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

-- handle_business_deletion_stock_refunds: refund_amount/current_stock_price
-- were DECIMAL(12,2)/DECIMAL(10,2) — a Tycoon business's stock price and a
-- large holder's refund can each exceed that.
CREATE OR REPLACE FUNCTION handle_business_deletion_stock_refunds() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stock_record RECORD;
holding_record RECORD;
refund_amount NUMERIC;
current_stock_price NUMERIC;
BEGIN -- Only process if the business is being deactivated (soft delete)
IF OLD.is_active = true
AND NEW.is_active = false THEN -- Get the stock record for this business
SELECT * INTO stock_record
FROM business_stocks
WHERE habit_business_id = NEW.id;
-- If there's a stock record, process refunds
IF FOUND THEN -- Get current stock price
current_stock_price := stock_record.current_stock_price;
-- Refund all stockholders
FOR holding_record IN
SELECT sh.*
FROM stock_holdings sh
WHERE sh.stock_id = stock_record.id
    AND sh.shares_owned > 0 LOOP -- Calculate refund: shares * current stock price
    refund_amount := holding_record.shares_owned * current_stock_price;
-- Add refund to user's cash, then recalculate net worth from scratch
UPDATE user_profiles
SET cash = cash + refund_amount,
    updated_at = NOW()
WHERE id = holding_record.holder_id;
PERFORM recalculate_net_worth(holding_record.holder_id);
-- Create a transaction record for the forced sale
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type,
        created_at
    )
VALUES (
        stock_record.id,
        NULL,
        -- No buyer for business deletion
        holding_record.holder_id,
        holding_record.shares_owned,
        current_stock_price,
        refund_amount,
        'business_deletion_refund',
        NOW()
    );
END LOOP;
-- Update the stock record to mark it as deleted
UPDATE business_stocks
SET is_active = false,
    updated_at = NOW()
WHERE id = stock_record.id;
END IF;
END IF;
-- Recalculate the business owner's own net worth too (their business_value component just changed)
PERFORM recalculate_net_worth(NEW.user_id);
RETURN NEW;
END;
$$;

-- create_joint_venture_proposal: v_share_others/v_creator_share were
-- NUMERIC(10,2) — a Tycoon-tier total_cost split across co-owners overflows
-- that immediately.
CREATE OR REPLACE FUNCTION create_joint_venture_proposal(
    p_creator_id UUID,
    p_business_type_id INTEGER,
    p_business_name TEXT,
    p_habit_description TEXT,
    p_invitee_ids UUID[],
    p_creator_timezone TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_invitee_ids UUID[];
    v_business_type business_types%ROWTYPE;
    v_n INTEGER;
    v_share_others NUMERIC;
    v_creator_share NUMERIC;
    v_creator_cash NUMERIC;
    v_creator_name TEXT;
    v_proposal_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_friend_count INTEGER;
    v_invitee_id UUID;
BEGIN
    IF p_creator_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Dedupe, and strip the creator's own id if it was somehow included.
    SELECT ARRAY(
        SELECT DISTINCT invitee_id FROM unnest(p_invitee_ids) AS invitee_id
        WHERE invitee_id <> p_creator_id
    ) INTO v_invitee_ids;

    IF v_invitee_ids IS NULL OR array_length(v_invitee_ids, 1) IS NULL OR array_length(v_invitee_ids, 1) < 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Select at least one friend to invite');
    END IF;

    SELECT COUNT(*) INTO v_friend_count
    FROM unnest(v_invitee_ids) AS invitee_id
    WHERE EXISTS (
        SELECT 1 FROM friendships f
        WHERE f.status = 'accepted'
          AND (
            (f.user_id = p_creator_id AND f.friend_id = invitee_id)
            OR (f.user_id = invitee_id AND f.friend_id = p_creator_id)
          )
    );
    IF v_friend_count <> array_length(v_invitee_ids, 1) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You can only invite accepted friends');
    END IF;

    SELECT * INTO v_business_type FROM business_types WHERE id = p_business_type_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid business type');
    END IF;

    IF COALESCE(TRIM(p_business_name), '') = '' OR COALESCE(TRIM(p_habit_description), '') = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'A habit name and description are required');
    END IF;

    v_n := array_length(v_invitee_ids, 1) + 1;
    -- Split/rounding rule: every non-initiating participant pays the same
    -- rounded share; the initiator absorbs the rounding remainder so the
    -- total collected always equals total_cost exactly.
    v_share_others := ROUND(v_business_type.base_cost / v_n, 2);
    v_creator_share := v_business_type.base_cost - v_share_others * (v_n - 1);

    SELECT cash, COALESCE(name, 'A friend') INTO v_creator_cash, v_creator_name
    FROM user_profiles WHERE id = p_creator_id;
    IF v_creator_cash IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    IF v_creator_cash < v_creator_share THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || to_char(v_creator_share, 'FM999,999,999,990.00') || ')');
    END IF;

    INSERT INTO joint_venture_proposals (
        creator_id, business_type_id, business_name, business_icon, habit_description, total_cost, creator_timezone
    ) VALUES (
        p_creator_id, p_business_type_id, TRIM(p_business_name), v_business_type.icon, TRIM(p_habit_description), v_business_type.base_cost, p_creator_timezone
    ) RETURNING id, expires_at INTO v_proposal_id, v_expires_at;

    -- Creator pays their own share immediately and is pre-accepted.
    INSERT INTO joint_venture_participants (proposal_id, user_id, is_creator, share_amount, status, paid, paid_at, responded_at)
    VALUES (v_proposal_id, p_creator_id, true, v_creator_share, 'accepted', true, NOW(), NOW());
    PERFORM adjust_user_cash(p_creator_id, -v_creator_share);

    FOREACH v_invitee_id IN ARRAY v_invitee_ids LOOP
        INSERT INTO joint_venture_participants (proposal_id, user_id, is_creator, share_amount, status, paid)
        VALUES (v_proposal_id, v_invitee_id, false, v_share_others, 'invited', false);

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        VALUES (
            p_creator_id, v_invitee_id,
            v_creator_name || ' invited you to co-found this business — $' || to_char(v_share_others, 'FM999,999,999,990.00') || ' to join.',
            'joint_venture_invite', false,
            jsonb_build_object(
                'proposal_id', v_proposal_id,
                'business_name', TRIM(p_business_name),
                'business_icon', v_business_type.icon,
                'business_type_name', v_business_type.name,
                'habit_description', TRIM(p_habit_description),
                'share_amount', v_share_others,
                'total_cost', v_business_type.base_cost,
                'co_owner_count', v_n,
                'creator_name', v_creator_name,
                'expires_at', v_expires_at
            )
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'proposal_id', v_proposal_id,
        'creator_share', v_creator_share,
        'share_amount', v_share_others,
        'co_owner_count', v_n,
        'expires_at', v_expires_at
    );
END;
$$;
GRANT EXECUTE ON FUNCTION create_joint_venture_proposal(UUID, INTEGER, TEXT, TEXT, UUID[], TEXT) TO authenticated;

-- propose_joint_venture_upgrade: v_share_others/v_initiator_share were
-- NUMERIC(10,2) — same overflow risk as create_joint_venture_proposal above.
CREATE OR REPLACE FUNCTION propose_joint_venture_upgrade(
    p_initiator_id UUID,
    p_habit_business_id UUID,
    p_new_business_type_id INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_habit habit_businesses%ROWTYPE;
    v_new_type business_types%ROWTYPE;
    v_n INTEGER;
    v_share_others NUMERIC;
    v_initiator_share NUMERIC;
    v_initiator_cash NUMERIC;
    v_initiator_name TEXT;
    v_proposal_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_co_owner RECORD;
BEGIN
    IF p_initiator_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_habit FROM habit_businesses WHERE id = p_habit_business_id;
    IF NOT FOUND OR NOT v_habit.is_joint_venture OR NOT v_habit.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Joint venture business not found');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = p_initiator_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not a co-owner of this business');
    END IF;
    IF EXISTS (SELECT 1 FROM joint_venture_upgrade_proposals WHERE habit_business_id = p_habit_business_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'An upgrade is already pending for this business');
    END IF;
    -- Fail fast if the 24h upgrade cooldown (guard_habit_business_mutation)
    -- would reject this anyway — no point collecting money for it.
    IF NOW() - COALESCE(v_habit.last_upgraded_at, v_habit.created_at) < INTERVAL '24 hours' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This business can only be upgraded once every 24 hours');
    END IF;

    SELECT * INTO v_new_type FROM business_types WHERE id = p_new_business_type_id;
    IF NOT FOUND OR v_new_type.base_cost <= v_habit.cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid upgrade tier');
    END IF;

    SELECT COUNT(*) INTO v_n FROM business_co_owners WHERE habit_business_id = p_habit_business_id;

    v_share_others := ROUND(v_new_type.base_cost / v_n, 2);
    v_initiator_share := v_new_type.base_cost - v_share_others * (v_n - 1);

    SELECT cash, COALESCE(name, 'A friend') INTO v_initiator_cash, v_initiator_name FROM user_profiles WHERE id = p_initiator_id;
    IF v_initiator_cash < v_initiator_share THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_initiator_share || ')');
    END IF;

    INSERT INTO joint_venture_upgrade_proposals (habit_business_id, initiator_id, new_business_type_id, total_upgrade_cost)
    VALUES (p_habit_business_id, p_initiator_id, p_new_business_type_id, v_new_type.base_cost)
    RETURNING id, expires_at INTO v_proposal_id, v_expires_at;

    INSERT INTO joint_venture_upgrade_participants (upgrade_proposal_id, user_id, is_initiator, share_amount, status, paid, paid_at, responded_at)
    VALUES (v_proposal_id, p_initiator_id, true, v_initiator_share, 'accepted', true, NOW(), NOW());
    PERFORM adjust_user_cash(p_initiator_id, -v_initiator_share);

    FOR v_co_owner IN SELECT user_id FROM business_co_owners WHERE habit_business_id = p_habit_business_id AND user_id <> p_initiator_id LOOP
        INSERT INTO joint_venture_upgrade_participants (upgrade_proposal_id, user_id, is_initiator, share_amount, status, paid)
        VALUES (v_proposal_id, v_co_owner.user_id, false, v_share_others, 'invited', false);

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        VALUES (
            p_initiator_id, v_co_owner.user_id,
            v_initiator_name || ' wants to upgrade "' || v_habit.business_name || '" to ' || v_new_type.name || ' — $' || v_share_others || ' to chip in.',
            'joint_venture_upgrade_request', false,
            jsonb_build_object(
                'upgrade_proposal_id', v_proposal_id,
                'habit_business_id', p_habit_business_id,
                'business_name', v_habit.business_name,
                'business_icon', v_habit.business_icon,
                'new_business_type_name', v_new_type.name,
                'new_business_icon', v_new_type.icon,
                'share_amount', v_share_others,
                'total_cost', v_new_type.base_cost,
                'initiator_name', v_initiator_name,
                'expires_at', v_expires_at
            )
        );
    END LOOP;

    RETURN jsonb_build_object('success', true, 'upgrade_proposal_id', v_proposal_id, 'initiator_share', v_initiator_share, 'share_amount', v_share_others, 'expires_at', v_expires_at);
END;
$$;
GRANT EXECUTE ON FUNCTION propose_joint_venture_upgrade(UUID, UUID, INTEGER) TO authenticated;

-- get_mutual_friends: friend_cash/friend_net_worth were DECIMAL(15,2) — a
-- friend's cash/net worth can now exceed that once Tycoon businesses are in
-- play. Changing a RETURNS TABLE column's type isn't allowed via plain
-- CREATE OR REPLACE ("cannot change return type of existing function") —
-- the old signature has to be dropped first.
DROP FUNCTION IF EXISTS get_mutual_friends(UUID);
CREATE OR REPLACE FUNCTION get_mutual_friends(user_uuid UUID) RETURNS TABLE (
        friend_id UUID,
        friend_name TEXT,
        friend_email TEXT,
        friend_avatar_url TEXT,
        friend_cash NUMERIC,
        friend_net_worth NUMERIC,
        friendship_created_at TIMESTAMP WITH TIME ZONE
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT up.id as friend_id,
    up.name as friend_name,
    up.email as friend_email,
    up.avatar_url as friend_avatar_url,
    up.cash as friend_cash,
    up.net_worth as friend_net_worth,
    f.created_at as friendship_created_at
FROM friendships f
    JOIN user_profiles up ON up.id = f.friend_id
WHERE f.user_id = user_uuid
    AND f.status = 'accepted'
    AND EXISTS (
        SELECT 1
        FROM friendships f2
        WHERE f2.user_id = f.friend_id
            AND f2.friend_id = f.user_id
            AND f2.status = 'accepted'
    )
ORDER BY f.created_at DESC;
END;
$$;

NOTIFY pgrst, 'reload schema';
