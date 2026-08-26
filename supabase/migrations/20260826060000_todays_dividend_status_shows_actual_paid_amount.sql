-- Fix: "Today's Stock Dividends" popup shows a wildly wrong dollar amount
-- for businesses already marked COMPLETED.
--
-- get_todays_dividend_status's dividend_per_completion column is a *live*
-- estimate — it's recomputed every time from the business's CURRENT
-- earnings_per_completion, streak and shares-sold, using the same formula
-- for every row regardless of completed_today. The modal (see
-- todays-dividends-modal.component.html) renders that number next to the
-- COMPLETED badge as if it were what got paid, but it's really "what this
-- holding would earn if the business completed again right now" — for a
-- business whose streak or ownership has kept moving today (e.g. multiple
-- joint-venture check-ins, or several habit completions), that live rate
-- can be many times larger than what was actually credited earlier today.
--
-- This is externally visible: the modal's own hero total
-- (liveTodaysStockEarnings, from getTodaysStockDividends — a real SUM of
-- stock_dividend_distributions.total_dividend rows) is the ground truth for
-- "cash actually received today," and it can come in *lower* than a single
-- COMPLETED row's live-estimate figure, which is exactly the discrepancy
-- being reported (one Oil Company holding showing a live estimate of
-- ~$8.6M while the whole day's actual total was ~$2.45M).
--
-- Fix: for a holding that has completed_today = true, replace the live
-- estimate with the actual sum of stock_dividend_distributions.total_dividend
-- this holder was paid today for this stock (joined back through
-- dividend_payments -> habit_completions so "today" uses the exact same
-- v_period_start boundary as completed_today itself). Rows still pending
-- today keep the existing live per-completion estimate, since there's no
-- real payment yet to show.
CREATE OR REPLACE FUNCTION get_todays_dividend_status(
    user_uuid UUID,
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS TABLE (
    holding_id UUID,
    stock_id UUID,
    business_id UUID,
    business_name TEXT,
    business_icon TEXT,
    owner_id UUID,
    owner_name TEXT,
    is_joint_venture BOOLEAN,
    co_owner_count INTEGER,
    shares_owned INTEGER,
    dividend_per_completion NUMERIC,
    completed_today BOOLEAN,
    is_active_today BOOLEAN,
    reminded_today BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_period_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
    v_dow INTEGER := EXTRACT(DOW FROM NOW() AT TIME ZONE p_client_timezone)::INTEGER;
BEGIN
    RETURN QUERY
    SELECT
        sh.id AS holding_id,
        bs.id AS stock_id,
        hb.id AS business_id,
        bt.name AS business_name,
        bt.icon AS business_icon,
        hb.user_id AS owner_id,
        up.name AS owner_name,
        hb.is_joint_venture,
        COALESCE(co.n, 0)::INTEGER AS co_owner_count,
        sh.shares_owned,
        -- Already completed today -> show what was actually paid (real
        -- money, never drifts from the hero total above it). Not yet
        -- completed -> keep the live per-completion preview so the row
        -- still shows something before any payment exists.
        CASE
            WHEN paid.today_total IS NOT NULL AND paid.today_total > 0 THEN paid.today_total
            ELSE
                GREATEST(
                    ROUND(
                        (
                            (
                                hb.earnings_per_completion + hb.earnings_per_completion * (
                                    GREATEST(
                                        0,
                                        (COALESCE(bs.total_shares_issued, 100) - COALESCE(bs.shares_owned_by_owner, 100)) - COALESCE(bs.shares_available, 0)
                                    )::NUMERIC / 100
                                )
                            ) * (
                                1 + CASE WHEN hb.streak > 0 THEN LEAST(hb.streak * 0.1, 1) ELSE 0 END
                            )
                        ) * sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC,
                        2
                    ),
                    0.01
                )
        END AS dividend_per_completion,
        EXISTS (
            SELECT 1 FROM habit_completions hc
            WHERE hc.habit_business_id = hb.id AND hc.completed_at >= v_period_start
        ) AS completed_today,
        CASE
            WHEN (hb.recurrence_interval IN ('specific_days', '7d') OR hb.frequency = 'weekly')
                THEN (v_dow = ANY(COALESCE(hb.active_days, ARRAY[]::INTEGER[])))
            ELSE true
        END AS is_active_today,
        EXISTS (
            SELECT 1 FROM social_pokes sp
            WHERE sp.type = 'stockholder_reminder'
                AND sp.from_user_id = user_uuid
                AND sp.to_user_id = hb.user_id
                AND (sp.metadata->>'habit_business_id')::UUID = hb.id
                AND sp.created_at >= v_period_start
        ) AS reminded_today
    FROM stock_holdings sh
        INNER JOIN business_stocks bs ON sh.stock_id = bs.id
        INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
        INNER JOIN business_types bt ON hb.business_type_id = bt.id
        INNER JOIN user_profiles up ON hb.user_id = up.id
        LEFT JOIN (
            SELECT habit_business_id, COUNT(*) AS n FROM business_co_owners GROUP BY habit_business_id
        ) co ON co.habit_business_id = hb.id
        LEFT JOIN LATERAL (
            SELECT SUM(sdd.total_dividend) AS today_total
            FROM stock_dividend_distributions sdd
                INNER JOIN dividend_payments dp ON dp.id = sdd.dividend_payment_id
                INNER JOIN habit_completions hc ON hc.id = dp.habit_completion_id
            WHERE dp.stock_id = bs.id
                AND sdd.stockholder_id = user_uuid
                AND hc.completed_at >= v_period_start
        ) paid ON true
    WHERE sh.holder_id = user_uuid
        AND sh.shares_owned > 0
        AND hb.is_active = true
    ORDER BY completed_today ASC, bt.name ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_todays_dividend_status(UUID, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
