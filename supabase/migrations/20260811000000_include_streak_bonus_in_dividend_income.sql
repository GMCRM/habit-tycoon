-- Include the streak bonus in the dividend base.
--
-- 20260810010000_fix_dividend_per_share_formula.sql defined a completion's
-- "complete income" (the amount each of the business's 100 shares is worth
-- 1/100th of) as base_earnings + stock_boost, deliberately excluding the
-- streak bonus — reasoning that streak was a personal, per-owner bonus
-- unrelated to stock ownership.
--
-- Product call: the streak bonus IS part of what the owner made from this
-- completion, so it belongs in the dividend base too, same as the stock
-- boost. habit_completions.earnings (fetched below as base_earnings) is
-- already the owner's full credited total for the completion — base pay +
-- stock boost + streak bonus, all folded in by the caller (see
-- complete_habit_business etc.) — so "complete income" is simply that
-- figure directly; no separate addition of stock_boost on top (it's
-- already inside base_earnings, and adding it again would double-count it).
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(
    completion_uuid UUID,
    p_stock_boost_amount NUMERIC DEFAULT NULL,
    p_base_earnings NUMERIC DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    habit_business_uuid UUID;
    business_owner_id UUID;
    stock_uuid UUID;
    base_earnings NUMERIC;
    stock_boost NUMERIC := 0;
    complete_income NUMERIC;
    total_dividend_pool NUMERIC;
    dividend_payment_uuid UUID;
    stockholder RECORD;
    dividend_per_share NUMERIC;
    stockholder_dividend NUMERIC;
    shares_owned_by_owner INTEGER;
    shares_available INTEGER;
    total_shares_issued INTEGER;
    shares_sold_to_investors INTEGER;
    stock_boost_percentage NUMERIC;
    holder_count INTEGER;
    shares_held_total INTEGER;
BEGIN
    -- Get completion details. `earnings` here is the owner's full credited
    -- total for the completion (base pay + stock boost + streak bonus).
    SELECT habit_business_id,
        user_id,
        earnings INTO habit_business_uuid,
        business_owner_id,
        base_earnings
    FROM habit_completions
    WHERE id = completion_uuid;

    -- Get stock details
    SELECT bs.id,
        bs.shares_owned_by_owner,
        bs.shares_available,
        bs.total_shares_issued INTO stock_uuid,
        shares_owned_by_owner,
        shares_available,
        total_shares_issued
    FROM business_stocks bs
    WHERE bs.habit_business_id = habit_business_uuid;

    IF stock_uuid IS NULL THEN
        RETURN; -- No stock exists for this business
    END IF;

    -- How many external stockholders are there?
    SELECT COUNT(*) INTO holder_count
    FROM stock_holdings
    WHERE stock_id = stock_uuid
        AND shares_owned > 0;

    IF holder_count = 0 THEN
        RETURN; -- No stockholders, nothing to pay
    END IF;

    -- stock_boost is recorded on the dividend_payments row for
    -- reporting/debugging (and drives the fallback below) but no longer
    -- feeds the payout math directly — it's already folded into
    -- base_earnings by the caller.
    IF p_stock_boost_amount IS NOT NULL THEN
        stock_boost := GREATEST(p_stock_boost_amount, 0);
    ELSE
        -- Fallback: 1% of base pay per tradeable share actually purchased by investors
        shares_sold_to_investors := (total_shares_issued - shares_owned_by_owner) - shares_available;
        stock_boost_percentage := GREATEST(shares_sold_to_investors, 0);
        stock_boost := COALESCE(p_base_earnings, base_earnings) * (stock_boost_percentage / 100);
    END IF;

    -- "Complete income" of the business for this completion = whatever the
    -- owner actually made (base pay + stock boost + streak bonus) — every
    -- one of the 100 shares the business is cut into is worth 1/100th of it.
    complete_income := base_earnings;
    dividend_per_share := complete_income / 100;

    SELECT COALESCE(SUM(shares_owned), 0) INTO shares_held_total
    FROM stock_holdings
    WHERE stock_id = stock_uuid
        AND shares_owned > 0;

    total_dividend_pool := dividend_per_share * shares_held_total;

    -- Record the dividend payment event
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

    FOR stockholder IN
        SELECT holder_id,
            shares_owned
        FROM stock_holdings
        WHERE stock_id = stock_uuid
            AND shares_owned > 0
    LOOP
        stockholder_dividend := stockholder.shares_owned * dividend_per_share;
        -- Always pay at least $0.01 per stockholder per completion
        stockholder_dividend := GREATEST(stockholder_dividend, 0.01);

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

        UPDATE user_profiles
        SET cash = cash + stockholder_dividend,
            updated_at = NOW()
        WHERE id = stockholder.holder_id;

        PERFORM recalculate_net_worth(stockholder.holder_id);

        UPDATE stock_holdings
        SET total_dividends_earned = total_dividends_earned + stockholder_dividend,
            updated_at = NOW()
        WHERE holder_id = stockholder.holder_id
            AND stock_id = stock_uuid;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID, NUMERIC, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
