-- MIGRATION 006: Fix $0.00 expected/share display and zero-pool dividend bypass
--
-- TWO BUGS:
--
-- BUG 1 (Display): get_friend_businesses_for_stocks computes potential_dividend
-- as earnings / total_shares. For low-earning habits this rounds to $0.00 even
-- though the $0.01 minimum applies at payout time. Fix: wrap in GREATEST(..., 0.01).
--
-- BUG 2 (Payout): process_habit_completion_dividends returns early when
-- total_dividend_pool <= 0 (which happens whenever external ownership < 10%,
-- because stock_boost_percentage floors to 0). The $0.01 minimum added in
-- migration 005 is inside the loop that never runs. Fix: only return early
-- if there are no stockholders at all; otherwise always pay the $0.01 minimum.

-- ─── FIX 1: Display formula ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_friend_businesses_for_stocks(user_uuid UUID)
RETURNS TABLE (
    business_id             UUID,
    business_name           TEXT,
    business_icon           TEXT,
    owner_id                UUID,
    owner_name              TEXT,
    streak                  INTEGER,
    frequency               TEXT,
    goal_value              INTEGER,
    current_progress        INTEGER,
    earnings_per_completion NUMERIC,
    stock_id                UUID,
    stock_price             NUMERIC,
    base_price              NUMERIC,
    price_multiplier        NUMERIC,
    shares_available        INTEGER,
    total_shares            INTEGER,
    potential_dividend      NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        hb.id,
        bt.name                                                         AS business_name,
        hb.business_icon,
        hb.user_id,
        up.name,
        hb.streak,
        hb.frequency,
        hb.goal_value,
        hb.current_progress,
        hb.earnings_per_completion,
        bs.id                                                           AS stock_id,
        COALESCE(
            bs.current_stock_price,
            COALESCE(hb.earnings_per_completion, 1) * COALESCE(bs.price_multiplier, 1)
        )                                                               AS stock_price,
        COALESCE(hb.earnings_per_completion, 1)                        AS base_price,
        bs.price_multiplier,
        bs.shares_available,
        bs.total_shares_issued,
        -- Minimum $0.01 per share per completion regardless of pool size
        GREATEST(
            ROUND(
                (
                    (hb.earnings_per_completion * 1.0)
                    * LEAST(1 + (hb.streak * 0.01), 2)
                    * CASE WHEN hb.current_progress >= hb.goal_value THEN 1.5 ELSE 1 END
                ) / COALESCE(NULLIF(bs.total_shares_issued, 0), 100),
                2
            ),
            0.01
        )                                                               AS potential_dividend
    FROM habit_businesses hb
        INNER JOIN user_profiles  up ON hb.user_id          = up.id
        INNER JOIN business_types bt ON hb.business_type_id = bt.id
        LEFT  JOIN business_stocks bs ON hb.id              = bs.habit_business_id
        INNER JOIN friendships f ON (
            (f.user_id = user_uuid AND f.friend_id = hb.user_id)
            OR
            (f.friend_id = user_uuid AND f.user_id = hb.user_id)
        )
    WHERE hb.is_active = true
      AND hb.user_id  != user_uuid
      AND f.status     = 'accepted'
      AND (bs.shares_available > 0 OR bs.shares_available IS NULL)
    ORDER BY hb.streak DESC, hb.business_name;
END;
$$;

GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;


-- ─── FIX 2: Payout function — always pay $0.01 when stockholders exist ────
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(completion_uuid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    habit_business_uuid        UUID;
    business_owner_id          UUID;
    stock_uuid                 UUID;
    base_earnings              NUMERIC;
    stock_boost                NUMERIC := 0;
    total_dividend_pool        NUMERIC;
    dividend_payment_uuid      UUID;
    stockholder                RECORD;
    dividend_per_share         NUMERIC;
    stockholder_dividend       NUMERIC;
    shares_owned_by_owner      INTEGER;
    total_shares_issued        INTEGER;
    shares_owned_by_others     INTEGER;
    other_ownership_percentage NUMERIC;
    stock_boost_percentage     NUMERIC;
    holder_count               INTEGER;
BEGIN
    -- Get completion details
    SELECT habit_business_id, user_id, earnings
    INTO   habit_business_uuid, business_owner_id, base_earnings
    FROM   habit_completions
    WHERE  id = completion_uuid;

    -- Get stock details
    SELECT bs.id, bs.shares_owned_by_owner, bs.total_shares_issued
    INTO   stock_uuid, shares_owned_by_owner, total_shares_issued
    FROM   business_stocks bs
    WHERE  bs.habit_business_id = habit_business_uuid;

    IF stock_uuid IS NULL THEN
        RETURN; -- No stock exists for this business
    END IF;

    -- How many external stockholders are there?
    SELECT COUNT(*) INTO holder_count
    FROM   stock_holdings
    WHERE  stock_id     = stock_uuid
      AND  shares_owned > 0;

    IF holder_count = 0 THEN
        RETURN; -- No stockholders, nothing to pay
    END IF;

    -- Calculate stock boost: 5% bonus per 10% of shares owned by others
    shares_owned_by_others     := total_shares_issued - shares_owned_by_owner;
    other_ownership_percentage := (shares_owned_by_others::NUMERIC / total_shares_issued::NUMERIC) * 100;
    stock_boost_percentage     := FLOOR(other_ownership_percentage / 10) * 5;
    stock_boost                := base_earnings * (stock_boost_percentage / 100);

    -- Dividend pool (may be 0 when ownership is < 10% — minimums will still apply)
    total_dividend_pool := stock_boost * 0.5;

    -- Record the dividend payment event
    INSERT INTO dividend_payments (
        stock_id, habit_completion_id, business_owner_id,
        base_earnings, stock_boost_amount, total_dividend_pool
    )
    VALUES (
        stock_uuid, completion_uuid, business_owner_id,
        base_earnings, stock_boost, total_dividend_pool
    )
    RETURNING id INTO dividend_payment_uuid;

    -- Compute per-share rate (may be 0; minimum will be enforced per stockholder)
    SELECT COALESCE(SUM(shares_owned), 0) INTO dividend_per_share
    FROM   stock_holdings
    WHERE  stock_id = stock_uuid;

    IF dividend_per_share > 0 THEN
        dividend_per_share := total_dividend_pool / dividend_per_share;
    ELSE
        dividend_per_share := 0;
    END IF;

    FOR stockholder IN
        SELECT holder_id, shares_owned
        FROM   stock_holdings
        WHERE  stock_id     = stock_uuid
          AND  shares_owned > 0
    LOOP
        stockholder_dividend := stockholder.shares_owned * dividend_per_share;

        -- Always pay at least $0.01 per stockholder per completion
        stockholder_dividend := GREATEST(stockholder_dividend, 0.01);

        INSERT INTO stock_dividend_distributions (
            dividend_payment_id, stockholder_id, shares_owned,
            dividend_per_share, total_dividend
        )
        VALUES (
            dividend_payment_uuid, stockholder.holder_id, stockholder.shares_owned,
            dividend_per_share, stockholder_dividend
        );

        UPDATE user_profiles
        SET    cash       = cash + stockholder_dividend,
               updated_at = NOW()
        WHERE  id = stockholder.holder_id;

        UPDATE stock_holdings
        SET    total_dividends_earned = total_dividends_earned + stockholder_dividend,
               updated_at             = NOW()
        WHERE  holder_id = stockholder.holder_id
          AND  stock_id  = stock_uuid;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;
