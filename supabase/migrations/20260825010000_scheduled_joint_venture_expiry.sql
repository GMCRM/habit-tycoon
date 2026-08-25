-- Joint Venture — scheduled backend expiry.
--
-- resolve_expired_joint_venture_proposals/_upgrades/_deletion_votes (see
-- 20260807100000_joint_venture_notifications.sql,
-- 20260807070000_joint_venture_upgrade.sql,
-- 20260807080000_joint_venture_deletion.sql) already delete a group's
-- notification card the instant everyone has acted — an explicit decline/
-- no vote cancels the whole thing immediately, and the accept/pay/yes-vote
-- that completes the set clears every remaining card too. What they don't
-- cover is the other half of "whichever comes first": expiry only actually
-- runs when some affected participant's client happens to call the lazy
-- resolve RPC (on page load), scoped to just their own pending items. If
-- nobody in an expired group opens the app, the stale card never clears
-- for anyone.
--
-- This adds global, unscoped equivalents of those three resolve functions
-- (every pending+expired row across all users, not just one caller's) and
-- schedules them via pg_cron — same mechanism as sync-stock-prices-hourly
-- in 20260811020000_fix_ramp_compounding_and_hourly_sync.sql — so expired
-- joint-venture notifications disappear for everyone without depending on
-- any particular user's session. The existing per-user lazy-resolve RPCs
-- are untouched and keep firing too; this is a backend safety net on top,
-- not a replacement.

CREATE OR REPLACE FUNCTION expire_all_joint_venture_proposals() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal_id UUID;
    v_proposal joint_venture_proposals%ROWTYPE;
    v_refund_row RECORD;
    v_resolved_count INTEGER := 0;
BEGIN
    FOR v_proposal_id IN
        SELECT id FROM joint_venture_proposals WHERE status = 'pending' AND expires_at <= NOW()
    LOOP
        SELECT * INTO v_proposal FROM joint_venture_proposals WHERE id = v_proposal_id FOR UPDATE;
        -- Re-check after acquiring the lock — a participant's own page load
        -- may have already resolved this one first.
        IF v_proposal.status <> 'pending' OR v_proposal.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_proposals SET status = 'expired', updated_at = NOW() WHERE id = v_proposal_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_invite'
          AND (metadata->>'proposal_id')::UUID = v_proposal_id;

        FOR v_refund_row IN
            SELECT id, user_id, share_amount FROM joint_venture_participants
            WHERE proposal_id = v_proposal_id AND paid = true AND refunded_at IS NULL
        LOOP
            PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
            UPDATE joint_venture_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
        END LOOP;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_proposal.creator_id, p.user_id,
            '"' || v_proposal.business_name || '" wasn''t fully funded in time — everyone who paid has been refunded.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'expired', 'proposal_id', v_proposal_id, 'business_name', v_proposal.business_name, 'business_icon', v_proposal.business_icon)
        FROM joint_venture_participants p WHERE p.proposal_id = v_proposal_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
COMMENT ON FUNCTION expire_all_joint_venture_proposals() IS 'Global, unscoped sweep of every pending+expired joint_venture_proposals row (not just one caller''s) — expires it, refunds paid participants, deletes the stale invite pokes, and posts the outcome poke. Called by the scheduled expire_joint_venture_notifications() job.';

CREATE OR REPLACE FUNCTION expire_all_joint_venture_upgrades() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal_id UUID;
    v_proposal joint_venture_upgrade_proposals%ROWTYPE;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_refund_row RECORD;
    v_resolved_count INTEGER := 0;
BEGIN
    FOR v_proposal_id IN
        SELECT id FROM joint_venture_upgrade_proposals WHERE status = 'pending' AND expires_at <= NOW()
    LOOP
        SELECT * INTO v_proposal FROM joint_venture_upgrade_proposals WHERE id = v_proposal_id FOR UPDATE;
        IF v_proposal.status <> 'pending' OR v_proposal.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_upgrade_proposals SET status = 'expired', updated_at = NOW() WHERE id = v_proposal_id;
        SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_proposal.habit_business_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_upgrade_request'
          AND (metadata->>'upgrade_proposal_id')::UUID = v_proposal_id;

        FOR v_refund_row IN
            SELECT id, user_id, share_amount FROM joint_venture_upgrade_participants
            WHERE upgrade_proposal_id = v_proposal_id AND paid = true AND refunded_at IS NULL
        LOOP
            PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
            UPDATE joint_venture_upgrade_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
        END LOOP;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_proposal.initiator_id, p.user_id,
            'The upgrade for "' || COALESCE(v_habit_name, 'your joint venture') || '" wasn''t fully funded in time — everyone who paid has been refunded.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'upgrade_expired', 'habit_business_id', v_proposal.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon)
        FROM joint_venture_upgrade_participants p WHERE p.upgrade_proposal_id = v_proposal_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
COMMENT ON FUNCTION expire_all_joint_venture_upgrades() IS 'Global, unscoped sweep of every pending+expired joint_venture_upgrade_proposals row — same shape as expire_all_joint_venture_proposals(), including the stale joint_venture_upgrade_request poke cleanup (resolve_expired_joint_venture_upgrades never deleted these itself; the client only stopped rendering resolved-status proposals). Called by the scheduled expire_joint_venture_notifications() job.';

CREATE OR REPLACE FUNCTION expire_all_joint_venture_deletion_votes() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_vote_id UUID;
    v_vote joint_venture_deletion_votes%ROWTYPE;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_resolved_count INTEGER := 0;
BEGIN
    FOR v_vote_id IN
        SELECT id FROM joint_venture_deletion_votes WHERE status = 'pending' AND expires_at <= NOW()
    LOOP
        SELECT * INTO v_vote FROM joint_venture_deletion_votes WHERE id = v_vote_id FOR UPDATE;
        IF v_vote.status <> 'pending' OR v_vote.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_deletion_votes SET status = 'expired', updated_at = NOW() WHERE id = v_vote_id;
        SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_vote.habit_business_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_deletion_vote'
          AND (metadata->>'vote_id')::UUID = v_vote_id;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_vote.initiator_id, bco.user_id,
            'The vote to delete "' || COALESCE(v_habit_name, 'your joint venture') || '" didn''t reach a majority in time — it stays as-is.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'vote_expired', 'habit_business_id', v_vote.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon)
        FROM business_co_owners bco WHERE bco.habit_business_id = v_vote.habit_business_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
COMMENT ON FUNCTION expire_all_joint_venture_deletion_votes() IS 'Global, unscoped sweep of every pending+expired joint_venture_deletion_votes row — same shape as expire_all_joint_venture_proposals(), including the stale joint_venture_deletion_vote poke cleanup that resolve_expired_joint_venture_deletion_votes never did itself. Called by the scheduled expire_joint_venture_notifications() job.';

-- ─── expire_joint_venture_notifications: the single entry point the
-- scheduled job calls. No p_user_id / auth.uid() check like the per-user
-- lazy-resolve RPCs — this runs as a backend job (pg_cron), not on behalf
-- of a signed-in caller, and is deliberately never GRANTed to
-- authenticated/anon so it can't be invoked from the client. ───
CREATE OR REPLACE FUNCTION expire_joint_venture_notifications() RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_total INTEGER := 0;
BEGIN
    v_total := v_total + expire_all_joint_venture_proposals();
    v_total := v_total + expire_all_joint_venture_upgrades();
    v_total := v_total + expire_all_joint_venture_deletion_votes();
    RETURN v_total;
END;
$$;
COMMENT ON FUNCTION expire_joint_venture_notifications() IS 'Scheduled via pg_cron (expire-joint-venture-notifications-5min) so every expired joint-venture invite/upgrade/deletion-vote notification disappears for the whole group on a timer, independent of any participant opening the app. Returns the number of proposals/votes it just expired, for cron.job_run_details.';

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-joint-venture-notifications-5min') THEN
        PERFORM cron.unschedule('expire-joint-venture-notifications-5min');
    END IF;
END $$;

SELECT cron.schedule('expire-joint-venture-notifications-5min', '*/5 * * * *', $$SELECT public.expire_joint_venture_notifications();$$);

NOTIFY pgrst, 'reload schema';
