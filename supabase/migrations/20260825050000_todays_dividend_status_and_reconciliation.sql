-- Home screen "Today's Stock Dividends" popup — per-business dividend status
-- for every stock the calling user holds, plus a scheduled backend
-- reconciliation job that repairs any dividend that silently failed to pay.
--
-- 1. get_todays_dividend_status(): one row per stock holding — business
--    identity, who owns/runs it, this holder's per-completion dividend
--    estimate (same formula as get_user_stock_portfolio's daily_dividend_rate
--    — see 20260820170000_fix_portfolio_daily_dividend_rate_formula.sql), and
--    whether that business has completed its habit today. "Completed today"
--    is read off habit_completions directly (an append-only, authoritative
--    record) rather than habit_businesses.current_progress/last_completed_at
--    — those columns are only rolled over lazily by reset_outdated_habits()
--    when *that business's own owner* opens the app (see
--    20260817010000_fix_reset_outdated_habits_timezone.sql), so for a
--    business some *other* user (a stockholder) is looking at, they can sit
--    stale showing yesterday's completion. habit_completions has no such
--    staleness. This also sidesteps needing to special-case joint ventures
--    (whose per-owner current_progress/goal_value aren't meaningful at all —
--    see complete_joint_venture_checkin in
--    20260820180000_jv_per_checkin_dividends_and_group_bonus.sql): "at least
--    one completion recorded today" is well-defined either way.
--
-- 2. reconcile_missed_stock_dividends(): complete_habit_business,
--    complete_habit_business_yesterday and complete_joint_venture_checkin all
--    wrap their process_habit_completion_dividends() call in
--    `EXCEPTION WHEN OTHERS` (see 20260824010000_log_dividend_processing_errors.sql
--    for the warning-log half of that) so a dividend bug never blocks the
--    habit completion itself — but that also means a transient failure
--    leaves a completion with no dividend_payments row, permanently, with
--    nothing to retry it. This sweeps every completion from the last 48h for
--    a stocked business that has real stockholders and no dividend_payments
--    row yet, and retries it. Scheduled via pg_cron every minute — same
--    mechanism as expire_joint_venture_notifications
--    (20260825010000_scheduled_joint_venture_expiry.sql) and
--    sync_all_stock_prices (20260811020000_fix_ramp_compounding_and_hourly_sync.sql)
--    — so the dividend status this popup shows (and the cash it's paid out)
--    stays accurate on its own, without depending on anyone reopening the
--    app. dividend_payments.habit_completion_id is UNIQUE, so a completion
--    already paid is never retried or double-paid.

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
    is_active_today BOOLEAN
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
        -- Public business type name/icon, never the private per-habit name/icon
        -- (same privacy rule as get_user_stock_portfolio and get_friend_businesses_for_stocks).
        bt.icon AS business_icon,
        hb.user_id AS owner_id,
        up.name AS owner_name,
        hb.is_joint_venture,
        COALESCE(co.n, 0)::INTEGER AS co_owner_count,
        sh.shares_owned,
        -- Same base + stock-boost + streak-bonus math as complete_habit_business's
        -- v_total_earnings, split across total_shares_issued and scaled to this
        -- holding's shares — identical formula to get_user_stock_portfolio's
        -- daily_dividend_rate. Minimum $0.01 per completion regardless of holding size.
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
        ) AS dividend_per_completion,
        EXISTS (
            SELECT 1 FROM habit_completions hc
            WHERE hc.habit_business_id = hb.id AND hc.completed_at >= v_period_start
        ) AS completed_today,
        -- CASE (not a bare boolean expression) so a NULL hb.frequency doesn't
        -- propagate NULL through the OR/AND below — CASE WHEN treats a NULL
        -- condition as non-matching and falls through to ELSE true, the same
        -- way habit-interval.service.ts's resolveInterval (and this same
        -- recurrence_interval/frequency check in complete_habit_business)
        -- treats a '24h' habit with no frequency set as always active.
        CASE
            WHEN (hb.recurrence_interval IN ('specific_days', '7d') OR hb.frequency = 'weekly')
                THEN (v_dow = ANY(COALESCE(hb.active_days, ARRAY[]::INTEGER[])))
            ELSE true
        END AS is_active_today
    FROM stock_holdings sh
        INNER JOIN business_stocks bs ON sh.stock_id = bs.id
        INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
        INNER JOIN business_types bt ON hb.business_type_id = bt.id
        INNER JOIN user_profiles up ON hb.user_id = up.id
        LEFT JOIN (
            SELECT habit_business_id, COUNT(*) AS n FROM business_co_owners GROUP BY habit_business_id
        ) co ON co.habit_business_id = hb.id
    WHERE sh.holder_id = user_uuid
        AND sh.shares_owned > 0
        AND hb.is_active = true
    ORDER BY completed_today ASC, bt.name ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_todays_dividend_status(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION reconcile_missed_stock_dividends() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_completion RECORD;
    v_reconciled_count INTEGER := 0;
BEGIN
    FOR v_completion IN
        SELECT hc.id
        FROM habit_completions hc
            INNER JOIN habit_businesses hb ON hb.id = hc.habit_business_id
            INNER JOIN business_stocks bs ON bs.habit_business_id = hb.id
        WHERE hc.completed_at >= NOW() - INTERVAL '48 hours'
            AND NOT EXISTS (
                SELECT 1 FROM dividend_payments dp WHERE dp.habit_completion_id = hc.id
            )
            AND EXISTS (
                SELECT 1 FROM stock_holdings sh WHERE sh.stock_id = bs.id AND sh.shares_owned > 0
            )
    LOOP
        BEGIN
            PERFORM process_habit_completion_dividends(v_completion.id);
            v_reconciled_count := v_reconciled_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'reconcile_missed_stock_dividends: failed for completion %: %', v_completion.id, SQLERRM;
        END;
    END LOOP;

    RETURN v_reconciled_count;
END;
$$;
COMMENT ON FUNCTION reconcile_missed_stock_dividends() IS 'Scheduled via pg_cron (reconcile-missed-stock-dividends-1min) every minute. Safety net for the EXCEPTION WHEN OTHERS around every process_habit_completion_dividends call site (complete_habit_business, complete_habit_business_yesterday, complete_joint_venture_checkin) — finds any completion in the last 48h for a stocked business with real stockholders that never produced a dividend_payments row, and retries it, so stockholder cash and the Today''s Stock Dividends popup stay accurate without depending on any user reopening the app. Deliberately never GRANTed to authenticated/anon — backend job only, not callable from the client.';

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reconcile-missed-stock-dividends-1min') THEN
        PERFORM cron.unschedule('reconcile-missed-stock-dividends-1min');
    END IF;
END $$;

SELECT cron.schedule('reconcile-missed-stock-dividends-1min', '* * * * *', $$SELECT public.reconcile_missed_stock_dividends();$$);

NOTIFY pgrst, 'reload schema';
