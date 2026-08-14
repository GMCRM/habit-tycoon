import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { HabitBusiness } from './habit-business.service';

export interface JointVentureProposalResult {
  success: boolean;
  error?: string;
  proposal_id?: string;
  creator_share?: number;
  share_amount?: number;
  co_owner_count?: number;
  expires_at?: string;
}

export interface JointVentureAcceptResult {
  success: boolean;
  error?: string;
  fully_funded?: boolean;
  habit_business_id?: string;
  accepted_count?: number;
  total_count?: number;
  waiting_on?: string[];
}

export interface JointVentureCheckinResult {
  success: boolean;
  error?: string;
  finalized?: boolean;
  earnings?: number;
  streak?: number;
  checked_in?: number;
  total?: number;
}

export interface JointVentureUndoResult {
  success: boolean;
  error?: string;
  earnings?: number;
}

export interface JointVentureUpgradeResult {
  success: boolean;
  error?: string;
  upgrade_proposal_id?: string;
  initiator_share?: number;
  share_amount?: number;
  expires_at?: string;
  fully_funded?: boolean;
  habit_business_id?: string;
  paid_count?: number;
  total_count?: number;
  waiting_on?: string[];
}

export interface JointVentureDeletionResult {
  success: boolean;
  error?: string;
  vote_id?: string;
  executed?: boolean;
  cancelled?: boolean;
  yes_count?: number;
  required_yes?: number;
  total_co_owners?: number;
  expires_at?: string;
}

export interface JointVentureStatusRow {
  habit_business_id: string;
  co_owner_id: string;
  co_owner_name: string;
  is_creator: boolean;
  checked_in_today: boolean;
  /** When this co-owner checked in today, or null if they haven't — drives the client-side undo-window countdown. */
  checked_in_at: string | null;
}

/** One co-owner's own view of a proposal/upgrade they're a party to. */
export interface JointVentureParticipation {
  proposal_id: string;
  business_name: string;
  business_icon: string;
  status: 'invited' | 'accepted' | 'declined';
  share_amount: number;
  proposal_status: 'pending' | 'funded' | 'cancelled' | 'expired';
  expires_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class JointVentureService {
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService.client;
  }

  // ─── Creation → invite → accept/decline → fund ───

  async createProposal(
    creatorId: string,
    businessTypeId: number,
    businessName: string,
    habitDescription: string,
    inviteeIds: string[],
    creatorTimezone: string = this.getDeviceTimezone()
  ): Promise<JointVentureProposalResult> {
    const { data, error } = await this.supabase.rpc('create_joint_venture_proposal', {
      p_creator_id: creatorId,
      p_business_type_id: businessTypeId,
      p_business_name: businessName,
      p_habit_description: habitDescription,
      p_invitee_ids: inviteeIds,
      p_creator_timezone: creatorTimezone
    });
    if (error) {
      console.error('Error creating joint venture proposal:', error);
      throw error;
    }
    return data as JointVentureProposalResult;
  }

  async acceptInvite(userId: string, proposalId: string): Promise<JointVentureAcceptResult> {
    const { data, error } = await this.supabase.rpc('accept_joint_venture_invite', {
      p_user_id: userId,
      p_proposal_id: proposalId
    });
    if (error) {
      console.error('Error accepting joint venture invite:', error);
      throw error;
    }
    return data as JointVentureAcceptResult;
  }

  async declineInvite(userId: string, proposalId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.rpc('decline_joint_venture_invite', {
      p_user_id: userId,
      p_proposal_id: proposalId
    });
    if (error) {
      console.error('Error declining joint venture invite:', error);
      throw error;
    }
    return data as { success: boolean; error?: string };
  }

  /** Refunds+cancels this user's own pending invites past their 24h window. Call on Home/Notifications load. */
  async resolveExpiredProposals(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('resolve_expired_joint_venture_proposals', { p_user_id: userId });
    if (error) {
      console.error('Error resolving expired joint venture proposals:', error);
      return 0;
    }
    return data as number;
  }

  async getMyParticipation(userId: string): Promise<JointVentureParticipation[]> {
    const { data, error } = await this.supabase.rpc('get_my_joint_venture_participation', { p_user_id: userId });
    if (error) {
      console.error('Error loading joint venture participation:', error);
      return [];
    }
    return data || [];
  }

  // ─── Daily check-in ───

  async checkIn(habitBusinessId: string, occurredAt: Date = new Date()): Promise<JointVentureCheckinResult> {
    const { data, error } = await this.supabase.rpc('complete_joint_venture_checkin', {
      p_habit_business_id: habitBusinessId,
      p_occurred_at: occurredAt.toISOString()
    });
    if (error) {
      console.error('Error completing joint venture check-in:', error);
      throw error;
    }
    return data as JointVentureCheckinResult;
  }

  /** Undo today's check-in — server-enforced 60s grace window, see undo_joint_venture_checkin. */
  async undoCheckIn(habitBusinessId: string): Promise<JointVentureUndoResult> {
    const { data, error } = await this.supabase.rpc('undo_joint_venture_checkin', {
      p_habit_business_id: habitBusinessId
    });
    if (error) {
      console.error('Error undoing joint venture check-in:', error);
      throw error;
    }
    return data as JointVentureUndoResult;
  }

  /** Every joint venture business this user co-owns (creator or invitee) — merge with getUserHabitBusinesses() and dedupe by id. */
  async getJointVentureBusinessesForCoOwner(userId: string): Promise<HabitBusiness[]> {
    const { data, error } = await this.supabase
      .from('habit_businesses')
      .select(`
        *,
        business_types (
          id, name, icon, base_cost, base_pay, description
        )
      `)
      .eq('is_joint_venture', true)
      .eq('is_active', true);
      // RLS (habit_businesses' "Co-owners can view joint venture businesses"
      // policy) already restricts this to rows where userId is a co-owner —
      // no explicit .eq('user_id', ...) filter would even work here for the
      // non-creator case, since the row's user_id is always the creator.

    if (error) {
      console.error('Error fetching joint venture businesses:', error);
      return [];
    }
    return data || [];
  }

  /** Today's check-in roster (per co-owner) for a set of joint venture businesses — drives the "waiting on Bob, Carol" home-card strip. */
  async getStatus(habitBusinessIds: string[]): Promise<JointVentureStatusRow[]> {
    if (habitBusinessIds.length === 0) return [];
    const { data, error } = await this.supabase.rpc('get_joint_venture_status', { p_habit_business_ids: habitBusinessIds });
    if (error) {
      console.error('Error fetching joint venture status:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      habit_business_id: row.habit_business_id,
      co_owner_id: row.co_owner_id,
      co_owner_name: row.co_owner_name,
      is_creator: row.is_creator,
      checked_in_today: row.checked_in_today,
      checked_in_at: row.checked_in_at ?? null
    }));
  }

  /** Nudge a specific co-owner who hasn't checked in today — shows up as a notification on their Social tab. */
  async sendReminder(fromUserId: string, toUserId: string, habitBusinessId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.rpc('send_joint_venture_reminder', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_habit_business_id: habitBusinessId
    });
    if (error) {
      console.error('Error sending joint venture reminder:', error);
      throw error;
    }
    return data as { success: boolean; error?: string };
  }

  // ─── Upgrade ───

  async proposeUpgrade(initiatorId: string, habitBusinessId: string, newBusinessTypeId: number): Promise<JointVentureUpgradeResult> {
    const { data, error } = await this.supabase.rpc('propose_joint_venture_upgrade', {
      p_initiator_id: initiatorId,
      p_habit_business_id: habitBusinessId,
      p_new_business_type_id: newBusinessTypeId
    });
    if (error) {
      console.error('Error proposing joint venture upgrade:', error);
      throw error;
    }
    return data as JointVentureUpgradeResult;
  }

  async payUpgradeShare(userId: string, upgradeProposalId: string): Promise<JointVentureUpgradeResult> {
    const { data, error } = await this.supabase.rpc('pay_joint_venture_upgrade_share', {
      p_user_id: userId,
      p_upgrade_proposal_id: upgradeProposalId
    });
    if (error) {
      console.error('Error paying joint venture upgrade share:', error);
      throw error;
    }
    return data as JointVentureUpgradeResult;
  }

  async declineUpgrade(userId: string, upgradeProposalId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.rpc('decline_joint_venture_upgrade', {
      p_user_id: userId,
      p_upgrade_proposal_id: upgradeProposalId
    });
    if (error) {
      console.error('Error declining joint venture upgrade:', error);
      throw error;
    }
    return data as { success: boolean; error?: string };
  }

  async resolveExpiredUpgrades(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('resolve_expired_joint_venture_upgrades', { p_user_id: userId });
    if (error) {
      console.error('Error resolving expired joint venture upgrades:', error);
      return 0;
    }
    return data as number;
  }

  // ─── Deletion vote ───

  async initiateDeletionVote(userId: string, habitBusinessId: string): Promise<JointVentureDeletionResult> {
    const { data, error } = await this.supabase.rpc('initiate_joint_venture_deletion', {
      p_user_id: userId,
      p_habit_business_id: habitBusinessId
    });
    if (error) {
      console.error('Error initiating joint venture deletion vote:', error);
      throw error;
    }
    return data as JointVentureDeletionResult;
  }

  async castDeletionBallot(userId: string, voteId: string, ballot: 'yes' | 'no'): Promise<JointVentureDeletionResult> {
    const { data, error } = await this.supabase.rpc('cast_joint_venture_deletion_ballot', {
      p_user_id: userId,
      p_vote_id: voteId,
      p_ballot: ballot
    });
    if (error) {
      console.error('Error casting joint venture deletion ballot:', error);
      throw error;
    }
    return data as JointVentureDeletionResult;
  }

  async resolveExpiredDeletionVotes(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('resolve_expired_joint_venture_deletion_votes', { p_user_id: userId });
    if (error) {
      console.error('Error resolving expired joint venture deletion votes:', error);
      return 0;
    }
    return data as number;
  }

  // ─── Lazy expiry — call once per Home/Notifications page load, alongside
  // the existing MarketplaceService.resolveExpiredListings() call. ───
  async resolveAllExpired(userId: string): Promise<void> {
    await Promise.allSettled([
      this.resolveExpiredProposals(userId),
      this.resolveExpiredUpgrades(userId),
      this.resolveExpiredDeletionVotes(userId)
    ]);
  }

  // ─── Timezone helpers — HabitIntervalService is device-local-time-only and
  // isn't IANA-timezone-aware, so a joint venture's fixed
  // joint_venture_timezone needs its own small helpers here. ───

  getDeviceTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  /** Today's date (YYYY-MM-DD) in the given IANA timezone. */
  getJvToday(timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC' }).format(new Date());
  }

  /** Seconds until this business's next daily reset (local midnight in its fixed timezone). */
  getJvSecondsUntilReset(timezone: string): number {
    const tz = timezone || 'UTC';
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now);
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
    const secondsSinceLocalMidnight = get('hour') * 3600 + get('minute') * 60 + get('second');
    return Math.max(0, 86400 - secondsSinceLocalMidnight);
  }
}
