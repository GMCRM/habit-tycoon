-- MIGRATION 005: Enforce minimum $0.01 dividend payout per stockholder per completion
--
-- PROBLEM: When a business habit has many required completions per day/week,
-- each individual completion has a small base_earnings value (e.g. $0.10 for
-- a 10x/day habit). The dividend pool per completion can be so small that each
-- stockholder receives less than $0.01 — effectively nothing.
--
-- FIX: After computing stockholder_dividend = shares_owned * dividend_per_share,
-- apply GREATEST(stockholder_dividend, 0.01) so every stockholder always earns
-- at least $0.01 per completion regardless of share count or pool size.

CREATE OR REPLACE FUNCTION process_habit_completion_dividends(completion_uuid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    habit_business_uuid       UUID;
    business_owner_id         UUID;
    stock_uuid                UUID;
    base_earnings             NUMERIC;
    stock_boost               NUMERIC := 0;
    total_dividend_pool       NUMERIC;
    dividend_payment_uuid     UUID;
    stockholder               RECORD;
    dividend_per_share        NUMERIC;
    stockholder_dividend      NUMERIC;
    shares_owned_by_owner     INTEGER;
    total_shares_issued       INTEGER;
    shares_owned_by_others    INTEGER;
    other_ownership_percentage NUMERIC;
    stock_boost_percentage    NUMERIC;
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

    -- Calculate stock boost: 5% bonus per 10% of shares owned by others
    shares_owned_by_others     := total_shares_issued - shares_owned_by_owner;
    other_ownership_percentage := (shares_owned_by_others::NUMERIC / total_shares_issued::NUMERIC) * 100;
    stock_boost_percentage     := FLOOR(other_ownership_percentage / 10) * 5;
    stock_boost                := base_earnings * (stock_boost_percentage / 100);

    -- Calculate dividend pool (50% of stock boost goes to dividends)
    total_dividend_pool := stock_boost * 0.5;

    IF total_dividend_pool <= 0 THEN
        RETURN; -- No dividends to distribute
    END IF;

    -- Record dividend payment
    INSERT INTO dividend_payments (
        stock_id, habit_completion_id, business_owner_id,
        base_earnings, stock_boost_amount, total_dividend_pool
    )
    VALUES (
        stock_uuid, completion_uuid, business_owner_id,
        base_earnings, stock_boost, total_dividend_pool
    )
    RETURNING id INTO dividend_payment_uuid;

    -- Compute dividend per share from total holdings
    SELECT COALESCE(SUM(shares_owned), 0) INTO dividend_per_share
    FROM   stock_holdings
    WHERE  stock_id = stock_uuid;

    IF dividend_per_share > 0 THEN
        dividend_per_share := total_dividend_pool / dividend_per_share;

        FOR stockholder IN
            SELECT holder_id, shares_owned
            FROM   stock_holdings
            WHERE  stock_id    = stock_uuid
              AND  shares_owned > 0
        LOOP
            stockholder_dividend := stockholder.shares_owned * dividend_per_share;

            -- Enforce minimum payout of $0.01 per stockholder per completion
            stockholder_dividend := GREATEST(stockholder_dividend, 0.01);

            -- Record distribution
            INSERT INTO stock_dividend_distributions (
                dividend_payment_id, stockholder_id, shares_owned,
                dividend_per_share, total_dividend
            )
            VALUES (
                dividend_payment_uuid, stockholder.holder_id, stockholder.shares_owned,
                dividend_per_share, stockholder_dividend
            );

            -- Credit stockholder's cash
            UPDATE user_profiles
            SET    cash       = cash + stockholder_dividend,
                   updated_at = NOW()
            WHERE  id = stockholder.holder_id;

            -- Update lifetime dividends on the holding
            UPDATE stock_holdings
            SET    total_dividends_earned = total_dividends_earned + stockholder_dividend,
                   updated_at             = NOW()
            WHERE  holder_id = stockholder.holder_id
              AND  stock_id  = stock_uuid;
        END LOOP;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;
