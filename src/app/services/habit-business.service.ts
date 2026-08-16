import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { ToastController } from '@ionic/angular/standalone';
import { HabitIntervalService } from './habit-interval.service';
import { SupabaseService } from './supabase.service';
import { OfflineQueueService, OfflineQueuedError } from './offline-queue.service';
import { HabitCacheService } from './habit-cache.service';
import { HabitUpdateService } from './habit-update.service';

export interface BusinessType {
  id: number;
  name: string;
  icon: string;
  base_cost: number;
  base_pay: number;
  description: string;
}

export interface HabitBusiness {
  id: string;
  user_id: string;
  business_type_id: number;
  business_name: string;
  business_icon: string;
  cost: number;
  habit_description: string;
  recurrence_interval: '24h' | '7d' | 'specific_days'; // '7d' kept for backward compat
  frequency?: 'daily' | 'weekly'; // @deprecated — use recurrence_interval
  active_days?: number[]; // DOW array (0=Sun…6=Sat), only used for 'specific_days'
  goal_value: number; // How many times per active day (e.g., 3 push-up sets/day)
  current_progress: number; // Current completions for this interval period
  earnings_per_completion: number;
  streak: number;
  longest_streak: number;
  total_completions: number;
  total_earnings: number;
  last_completed_at?: string;
  is_active: boolean;
  display_order: number; // User's preferred order for display
  user_custom_order: number; // User's original custom order (for resetting)
  last_upgraded_at?: string; // Last tier-upgrade timestamp; upgrades are rate-limited to once/24h
  marketplace_base_value?: number | null; // 70% of the business's tier price (business_types.base_cost), when this business was bought via the Marketplace; same figure as the cost*0.7 fallback below, just persisted so a Marketplace-sourced business doesn't need a business_types join to compute it
  marketplace_bonus_percent?: number | null; // Streak bonus % (0-100) baked into earnings_per_completion when this business was bought via the Marketplace; shown as a "+X%" badge on the habit card icon
  is_joint_venture?: boolean; // Co-owned by multiple friends (see JointVentureService) — always false for a single-owner business
  joint_venture_timezone?: string | null; // IANA tz captured from the creator at funding time; fixed for the business's lifetime, defines "today" for every co-owner's check-in. Null unless is_joint_venture.
  created_at: string;
  updated_at: string;
  business_types?: BusinessType;
}

export interface CreateHabitBusinessRequest {
  business_type_id: number;
  business_name: string;
  habit_description: string;
  recurrence_interval: '24h' | 'specific_days';
  goal_value: number;
  active_days?: number[]; // required when recurrence_interval === 'specific_days'
}

export interface StockOwner {
  name: string;
  sharesOwned: number;
  isBusinessOwner: boolean;
}

export interface BusinessStock {
  id: string;
  habit_business_id: string;
  business_owner_id: string;
  current_stock_price: number;
  total_shares_issued: number;
  shares_owned_by_owner: number;
  shares_available: number;
  price_multiplier: number;
  last_price_update: string;
  ramp_start_price?: number;
  ramp_start_at?: string;
  created_at: string;
  updated_at: string;
  habit_businesses?: {
    id: string;
    business_name: string;
    business_icon: string;
    streak: number;
    user_id: string;
    business_types?: {
      name: string;
      icon: string;
    };
  };
}

export interface StockHolding {
  id: string;
  holder_id: string;
  stock_id: string;
  shares_owned: number;
  average_purchase_price: number;
  total_invested: number;
  total_dividends_earned: number;
  business_stocks?: {
    id: string;
    current_stock_price: number;
    habit_businesses?: {
      id: string;
      business_name: string;
      business_icon: string;
      streak: number;
      business_types?: {
        name: string;
        icon: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class HabitBusinessService {
  private supabase: SupabaseClient;
  private toastController = inject(ToastController);
  private habitIntervalService = inject(HabitIntervalService);
  private offlineQueue = inject(OfflineQueueService);
  private habitCache = inject(HabitCacheService);
  private habitUpdateService = inject(HabitUpdateService);

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService.client;

    // Let the offline queue replay these mutations later by simply calling
    // the same public method again — its own validation runs fresh against
    // live server state at replay time, so a stale queued action fails the
    // same way a manual retry would. completeHabit/completeHabitYesterday/
    // undoHabitCompletion/createHabitBusiness take an explicit occurredAt (or
    // for create, a tempId) captured at the moment the user actually acted —
    // see each method's offline branch — so a replay days later still
    // resolves against the day it actually happened on, not the reconnect day.
    this.offlineQueue.registerHandler('completeHabit', (habitBusinessId: string, occurredAt: string) => this.completeHabit(habitBusinessId, occurredAt));
    this.offlineQueue.registerHandler('completeHabitYesterday', (habitBusinessId: string, occurredAt: string) => this.completeHabitYesterday(habitBusinessId, occurredAt));
    this.offlineQueue.registerHandler('undoHabitCompletion', (habitBusinessId: string, occurredAt: string) => this.undoHabitCompletion(habitBusinessId, occurredAt));
    this.offlineQueue.registerHandler('purchaseStockShares', (stockId: string, shares: number) => this.purchaseStockShares(stockId, shares));
    this.offlineQueue.registerHandler('sellStockShares', (stockId: string, shares: number) => this.sellStockShares(stockId, shares));
    this.offlineQueue.registerHandler('createHabitBusiness', (request: CreateHabitBusinessRequest) => this.createHabitBusiness(request));
    this.offlineQueue.registerHandler('updateHabitBusiness', (habitBusinessId: string, updates: any) => this.updateHabitBusiness(habitBusinessId, updates));
    this.offlineQueue.registerHandler('deleteHabitBusiness', (habitBusinessId: string) => this.deleteHabitBusiness(habitBusinessId));

    // Once every queued mutation has replayed successfully, the local cache
    // (habits, business types, profile) may be stale in ways the optimistic
    // math couldn't predict — e.g. dividends paid in from another user's
    // stock purchase, or server-smoothed stock price movement. Force a full
    // refresh from the server so the UI drops the "pending sync" numbers in
    // favor of true ones.
    this.offlineQueue.onDrainComplete(() => this.reconcileAfterSync());
  }

  /** Full refresh of the local cache from the server, run once after a successful queue drain. */
  private async reconcileAfterSync(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;
      await Promise.all([
        this.getUserHabitBusinesses(user.id),
        this.getBusinessTypes(),
        this.refreshProfileCache(user.id),
      ]);
    } catch (error) {
      console.error('[HabitBusinessService] reconcileAfterSync failed:', error);
    }
  }

  private async refreshProfileCache(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('cash, net_worth, name')
      .eq('id', userId)
      .single();
    if (!error && data) {
      await this.habitCache.setProfile(data);
    }
  }

  /**
   * Recompute a user's net_worth from scratch (cash + business value + portfolio value)
   * via the recalculate_net_worth() RPC, instead of nudging it by an ad hoc delta.
   */
  private async recalculateNetWorth(userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('recalculate_net_worth', { p_user_id: userId });
    if (error) {
      console.error('Error recalculating net worth:', error);
    }
  }

  /**
   * A business's base sell value (before the streak bonus): 70% of its
   * business-type (tier) cost — never 70% of whatever it last sold for on
   * the Marketplace, which would compound the discount on every resale.
   * Marketplace-sourced businesses persist this as marketplace_base_value
   * (set server-side by resolve_marketplace_purchase()); everything else
   * computes it here from cost*0.7. This is the floor that
   * getMarketplaceListingPrice() falls back to once a streak breaks (resets
   * to 0), and what a fresh (never-upgraded, streak-0) business sells for.
   */
  getBaseSellValue(business: { cost?: number; marketplace_base_value?: number | null }): number {
    if (business.marketplace_base_value != null) {
      return business.marketplace_base_value;
    }
    return Math.floor((business.cost || 0) * 0.7);
  }

  /**
   * Marketplace listing price: base sell value boosted by the habit's current
   * streak, capped at +100% (a 100-day+ streak), matching the cap already
   * used for the dividend/stock-price streak multiplier elsewhere.
   */
  private calculateMarketplaceListingPrice(baseSellValue: number, streak: number): number {
    const multiplier = 1 + Math.min(Math.max(streak, 0), 100) * 0.01;
    return Math.round(baseSellValue * multiplier * 100) / 100;
  }

  /**
   * The exact price a business would list for on the Marketplace right now —
   * used to preview the amount before an upgrade or habit deletion actually
   * creates the listing (e.g. a confirmation dialog).
   */
  getMarketplaceListingPrice(business: { cost?: number; marketplace_base_value?: number | null; streak?: number }): number {
    return this.calculateMarketplaceListingPrice(this.getBaseSellValue(business), business.streak || 0);
  }

  /**
   * Best-effort preview of when a new listing would actually land on the
   * Marketplace, for a confirmation dialog shown *before* the delete/upgrade
   * that creates it. Mirrors the server-side queueing in
   * create_marketplace_listing(): at most 2 of this seller's listings are
   * ever live at once, each new one staggered >=12h after their last
   * scheduled listing. This can race with a concurrent action and isn't
   * authoritative — the RPC computes the real value at creation time.
   */
  async previewNextListingTime(userId: string): Promise<Date> {
    const { data, error } = await this.supabase
      .from('marketplace_listings')
      .select('listed_at')
      .eq('seller_id', userId)
      .order('listed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error previewing next listing time:', error);
      return new Date();
    }

    const now = new Date();
    if (!data?.listed_at) {
      return now;
    }
    const candidate = new Date(new Date(data.listed_at).getTime() + 12 * 60 * 60 * 1000);
    return candidate > now ? candidate : now;
  }

  /**
   * Snapshot a business onto the Marketplace before it's overwritten (upgrade)
   * or deactivated (habit deletion). Returns the frozen listing price and the
   * time it's actually scheduled to appear (may be queued up to ~24h+ out if
   * the seller has other recent listings — see create_marketplace_listing()).
   */
  private async createMarketplaceListing(
    userId: string,
    business: HabitBusiness,
    reason: 'upgrade' | 'habit_deletion'
  ): Promise<{ listingPrice: number; listedAt: string }> {
    // marketplace_listings has no client-facing INSERT policy — the listing
    // (and its frozen price/scheduled time) is created server-side by this
    // SECURITY DEFINER RPC so a player can't fabricate an inflated sell price
    // or jump the queue.
    const { data, error } = await this.supabase.rpc('create_marketplace_listing', {
      p_user_id: userId,
      p_habit_business_id: business.id,
      p_reason: reason
    });

    if (error) {
      throw error;
    }

    return { listingPrice: Number(data.listing_price), listedAt: data.listed_at };
  }

  /**
   * Show an error toast message to the user
   */
  private async showErrorToast(message: string, duration: number = 4000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'top',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Show a success toast message to the user
   */
  private async showSuccessToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Show a loading toast (for operations that take time)
   */
  private async showLoadingToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 0, // Don't auto-dismiss
      color: 'medium',
      position: 'bottom'
    });
    await toast.present();
    return toast;
  }

  /**
   * Get all available business types
   */
  async getBusinessTypes(): Promise<BusinessType[]> {
    try {
      const { data, error } = await this.supabase
        .from('business_types')
        .select('*')
        .order('base_cost', { ascending: true });

      if (error) {
        console.error('Error fetching business types:', error);
        throw error;
      }

      await this.habitCache.setBusinessTypes(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getBusinessTypes:', error);
      const cached = await this.habitCache.getBusinessTypes();
      if (cached.length > 0) return cached;
      throw error;
    }
  }

  /**
   * Get user's habit-businesses ordered by display_order (for user customization).
   * Falls back to the last cached snapshot (see HabitCacheService) if the
   * network read fails — offline, or on a flaky connection — so the habit
   * list stays usable instead of going blank.
   */
  async getUserHabitBusinesses(userId: string): Promise<HabitBusiness[]> {
    try {
      const { data, error } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching habit businesses:', error);
        throw error;
      }

      await this.habitCache.setHabits(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getUserHabitBusinesses:', error);
      const cached = await this.habitCache.getHabits();
      if (cached.length > 0) return cached;
      throw error;
    }
  }

  /**
   * Count-only check for whether a user has ever created a habit — used by
   * the onboarding guards to distinguish a genuinely first-time user from
   * one who simply hasn't set `onboarding_completed_at` (e.g. an existing
   * user from before the flow was enabled).
   */
  async getUserHabitCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('habit_businesses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error counting habit businesses:', error);
      throw error;
    }

    return count ?? 0;
  }

  /**
   * Create a new habit-business
   */
  /**
   * Offline: the real row (and its business_stocks row) can't be created
   * without the server, so a client-generated placeholder id stands in for
   * it until the queued create replays — see OfflineQueueService's tempId
   * remapping. Returns normally (doesn't throw OfflineQueuedError) so the
   * caller's existing success path (dismiss the modal, show the new habit)
   * runs unmodified; the habit just carries a "local-" id and a pending-sync
   * indicator until it's replaced with the synced version.
   */
  async createHabitBusiness(request: CreateHabitBusinessRequest): Promise<HabitBusiness> {
    if (this.offlineQueue.isOffline()) {
      const businessType = (await this.habitCache.getBusinessTypes()).find(bt => bt.id === request.business_type_id);
      if (!businessType) {
        throw new Error("This business type isn't available offline yet — open the shop once while connected first.");
      }
      if (request.goal_value < 1 || request.goal_value > 20) {
        throw new Error('Goal value must be between 1 and 20');
      }
      const profile = await this.habitCache.getProfile();
      if (profile && profile.cash < businessType.base_cost) {
        const errorMsg = `Insufficient funds. Need $${businessType.base_cost.toFixed(2)}, but you only have $${profile.cash.toFixed(2)}`;
        await this.showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }

      const tempId = `local-${crypto.randomUUID()}`;
      const nowIso = new Date().toISOString();
      const nextOrderValue = (await this.habitCache.getHabits()).length + 1;

      const placeholder: HabitBusiness = {
        id: tempId,
        user_id: '',
        business_type_id: request.business_type_id,
        business_name: request.business_name,
        business_icon: businessType.icon,
        cost: businessType.base_cost,
        habit_description: request.habit_description,
        recurrence_interval: request.recurrence_interval,
        active_days: request.recurrence_interval === 'specific_days' ? (request.active_days || []) : undefined,
        goal_value: request.goal_value,
        current_progress: 0,
        earnings_per_completion: this.calculateReasonableEarnings(businessType.base_pay, request.goal_value),
        streak: 0,
        longest_streak: 0,
        total_completions: 0,
        total_earnings: 0,
        is_active: true,
        display_order: nextOrderValue,
        user_custom_order: nextOrderValue,
        created_at: nowIso,
        updated_at: nowIso,
        business_types: businessType,
      };

      await this.habitCache.upsertHabit(placeholder);
      await this.habitCache.adjustProfileCash(-businessType.base_cost);
      await this.offlineQueue.enqueue('createHabitBusiness', [request], `Create "${request.business_name}"`, tempId);
      await this.showSuccessToast(`✅ ${request.business_name} created — will sync once you're back online.`);
      this.habitUpdateService.emitHabitCreated(placeholder.id);
      return placeholder;
    }
    try {
      // First, get the business type to determine cost and earnings
      const { data: businessType, error: businessTypeError } = await this.supabase
        .from('business_types')
        .select('*')
        .eq('id', request.business_type_id)
        .single();

      if (businessTypeError || !businessType) {
        throw new Error('Invalid business type');
      }

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if user has enough cash
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      if (profile.cash < businessType.base_cost) {
        const errorMsg = `Insufficient funds. Need $${businessType.base_cost.toFixed(2)}, but you only have $${profile.cash.toFixed(2)}`;
        await this.showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate goal_value
      if (request.goal_value < 1 || request.goal_value > 20) {
        throw new Error('Goal value must be between 1 and 20');
      }

      // Get current user's habits count to set appropriate order
      const { data: existingHabits, error: countError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (countError) {
        console.error('Error counting existing habits:', countError);
        throw countError;
      }

      const nextOrderValue = (existingHabits?.length || 0) + 1;

      // Create the habit-business
      const habitBusinessData: any = {
        user_id: user.id,
        business_type_id: request.business_type_id,
        business_name: request.business_name,
        business_icon: businessType.icon,
        cost: businessType.base_cost,
        habit_description: request.habit_description,
        recurrence_interval: request.recurrence_interval,
        frequency: 'daily', // backward compat — specific_days behaves like daily
        active_days: request.recurrence_interval === 'specific_days' ? (request.active_days || []) : null,
        goal_value: request.goal_value,
        current_progress: 0,
        earnings_per_completion: this.calculateReasonableEarnings(businessType.base_pay, request.goal_value), // Use reasonable earnings calculation
        streak: 0,
        total_completions: 0,
        total_earnings: 0,
        display_order: nextOrderValue,
        user_custom_order: nextOrderValue,
        is_active: true
      };

      const { data: newHabitBusiness, error: createError } = await this.supabase
        .from('habit_businesses')
        .insert(habitBusinessData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating habit business:', createError);
        await this.showErrorToast('Failed to create habit business. Please try again.');
        throw createError;
      }

      // Deduct cost from user's cash
      const newCash = profile.cash - businessType.base_cost;
      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        console.error('Error updating user cash:', updateCashError);
        // Roll back the just-created row rather than leaving the user with a
        // free business — no DB transaction wraps these two writes, so this
        // compensating delete is the best available substitute.
        const { error: rollbackError } = await this.supabase
          .from('habit_businesses')
          .delete()
          .eq('id', newHabitBusiness.id);
        if (rollbackError) {
          console.error('Error rolling back habit business after failed payment:', rollbackError);
          await this.showErrorToast('Habit created but payment failed. Please contact support.');
          throw new Error('Habit-business created but failed to deduct payment');
        }
        await this.showErrorToast('Failed to create habit business. Please try again.');
        throw new Error('Failed to deduct payment for new habit-business');
      }

      await this.recalculateNetWorth(user.id);

      // Success message
      await this.showSuccessToast(`✅ ${request.business_name} created successfully!`);
      this.habitUpdateService.emitHabitCreated(newHabitBusiness.id);

      // The habit_businesses insert trigger (create_stock_on_business_creation) creates
      // the stock listing automatically — no separate createBusinessStock call needed here.

      return newHabitBusiness;
    } catch (error) {
      console.error('Error in createHabitBusiness:', error);
      // Only show error toast if we haven't already shown a specific one
      if (error instanceof Error && !error.message.includes('Insufficient funds')) {
        await this.showErrorToast('Failed to create habit business. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Upgrade an existing habit-business to a new business type
   */
  async upgradeHabitBusiness(habitBusinessId: string, newBusinessTypeId: number, upgradeCost: number): Promise<{ listedAt: string | null }> {
    let listedAt: string | null = null;
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the new business type details
      const { data: newBusinessType, error: businessTypeError } = await this.supabase
        .from('business_types')
        .select('*')
        .eq('id', newBusinessTypeId)
        .single();

      if (businessTypeError || !newBusinessType) {
        throw new Error('Invalid new business type');
      }

      // Get the current (pre-upgrade) business details — this is snapshotted onto a
      // Marketplace listing below, since the update further down mutates this same
      // row in place and nothing else preserves the old business afterwards.
      const { data: oldBusiness, error: oldBusinessError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      if (oldBusinessError || !oldBusiness) {
        throw new Error('Habit-business not found or you do not have permission to upgrade it');
      }
      if (oldBusiness.is_joint_venture) {
        // Joint ventures upgrade via JointVentureService.proposeUpgrade() — a
        // group-payment flow, not this single-owner in-place mutation. This
        // guard is defense-in-depth (the RLS UPDATE policy already blocks the
        // write below for a JV row) against a stale code path reaching here.
        throw new Error('This is a joint venture — use the group upgrade flow instead.');
      }

      // Check if user has enough cash for the upgrade
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('cash')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not load user profile');
      }

      if (profile.cash < upgradeCost) {
        throw new Error(`Insufficient funds. Need $${upgradeCost}, but you only have $${profile.cash}`);
      }

      // List the old business on the Marketplace before it's overwritten below.
      // The upgrade itself always proceeds regardless of whether this insert
      // succeeds or whether the listing ever sells.
      try {
        const listing = await this.createMarketplaceListing(user.id, oldBusiness, 'upgrade');
        listedAt = listing.listedAt;
      } catch (listingError) {
        console.error('Error creating marketplace listing for upgraded business:', listingError);
      }

      // Update the habit-business with new business type details
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({
          business_type_id: newBusinessTypeId,
          business_icon: newBusinessType.icon,
          cost: newBusinessType.base_cost,
          earnings_per_completion: this.calculateReasonableEarnings(newBusinessType.base_pay, 1), // Use reasonable earnings calculation
          marketplace_bonus_percent: null, // Earnings are fully recalculated by this upgrade, so any prior Marketplace bonus badge no longer applies
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId)
        .eq('user_id', user.id); // Ensure user owns this business

      if (updateError) {
        console.error('Error updating habit business:', updateError);
        throw updateError;
      }

      // Deduct upgrade cost from user's cash
      const newCash = profile.cash - upgradeCost;
      const { error: updateCashError } = await this.supabase
        .from('user_profiles')
        .update({ 
          cash: newCash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateCashError) {
        console.error('Error updating user cash after upgrade:', updateCashError);
        // Note: The business was upgraded but cash wasn't deducted
        // In a production app, you'd want to use a database transaction
        throw new Error('Business upgraded but failed to deduct payment');
      }

      return { listedAt };
    } catch (error) {
      console.error('Error in upgradeHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Update an existing habit-business
   */
  async updateHabitBusiness(habitBusinessId: string, updates: {
    business_name?: string;
    habit_description?: string;
    recurrence_interval?: '24h' | 'specific_days';
    goal_value?: number;
    active_days?: number[];
  }): Promise<void> {
    if (this.offlineQueue.isOffline()) {
      const cachedHabit = (await this.habitCache.getHabits()).find(h => h.id === habitBusinessId);
      if (!cachedHabit) {
        throw new Error("This habit isn't available offline yet — open it once while connected first.");
      }
      if (updates.goal_value !== undefined && (updates.goal_value < 1 || updates.goal_value > 99)) {
        throw new Error('Goal value must be between 1 and 99');
      }
      await this.habitCache.patchHabit(habitBusinessId, { ...updates, updated_at: new Date().toISOString() });
      await this.offlineQueue.enqueue('updateHabitBusiness', [habitBusinessId, updates], `Update "${cachedHabit.business_name}"`);
      return;
    }
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify the habit business belongs to the user
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found or you do not have permission to edit it');
      }

      // Validate goal_value if provided
      if (updates.goal_value !== undefined) {
        if (updates.goal_value < 1 || updates.goal_value > 99) {
          throw new Error('Goal value must be between 1 and 99');
        }
      }

      // Update the habit-business
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (updateError) {
        console.error('Error updating habit business:', updateError);
        throw updateError;
      }

    } catch (error) {
      console.error('Error in updateHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Delete (sell) a habit-business with loss penalty to prevent exploitation
   */
  async deleteHabitBusiness(habitBusinessId: string): Promise<{ listingPrice: number; listedAt: string | null }> {
    if (this.offlineQueue.isOffline()) {
      const cachedHabits = await this.habitCache.getHabits();
      const cachedHabit = cachedHabits.find(h => h.id === habitBusinessId);
      if (!cachedHabit) {
        throw new Error("This habit isn't available offline yet — open it once while connected first.");
      }
      if (cachedHabits.length <= 1) {
        throw new Error('Cannot delete your only habit business! You must have at least one active business.');
      }

      const isNeverSynced = habitBusinessId.startsWith('local-');
      if (isNeverSynced) {
        // This habit only ever existed locally — cancel its create (and
        // anything queued against it) out of the queue entirely rather than
        // creating it server-side just to immediately list it for sale, and
        // refund the cost that was optimistically deducted when it was
        // "bought", since nothing was ever actually purchased server-side.
        await this.offlineQueue.cancelAllForTempId(habitBusinessId);
        await this.habitCache.adjustProfileCash(cachedHabit.cost || 0);
        await this.habitCache.removeHabit(habitBusinessId);
        return { listingPrice: 0, listedAt: null };
      }

      // A real, previously-synced habit: the actual Marketplace listing (and
      // its server-computed price/queued listing time) can only be created
      // online — this just previews the same guaranteed payout already shown
      // in the confirm dialog (getMarketplaceListingPrice) as a provisional
      // credit, and queues the real deletion (which creates the real
      // listing) for replay. listedAt is unknowable until that replay runs.
      const listingPrice = this.getMarketplaceListingPrice(cachedHabit);
      await this.habitCache.adjustProfileCash(listingPrice);
      await this.habitCache.removeHabit(habitBusinessId);
      await this.offlineQueue.enqueue('deleteHabitBusiness', [habitBusinessId], `Delete "${cachedHabit.business_name}"`);
      return { listingPrice, listedAt: null };
    }
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the habit-business details with business type
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            name,
            base_cost
          )
        `)
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (habitError || !habitBusiness) {
        throw new Error('Habit-business not found or you do not have permission to delete it');
      }
      if (habitBusiness.is_joint_venture) {
        // Joint ventures delete via JointVentureService.initiateDeletionVote()
        // — a majority-vote flow, not this single-owner instant listing. This
        // guard is defense-in-depth (the RLS UPDATE policy already blocks the
        // write below for a JV row) against a stale code path reaching here.
        throw new Error('This is a joint venture — use the group deletion vote instead.');
      }

      // Check how many active habit businesses the user has
      const { data: userHabits, error: countError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (countError) {
        throw new Error('Could not verify your habit businesses');
      }

      if (!userHabits || userHabits.length <= 1) {
        throw new Error('Cannot delete your only habit business! You must have at least one active business.');
      }

      // Deleting a habit no longer pays out instantly — the business is listed on
      // the Marketplace instead. A friend can buy it within 24h for the listed
      // price, or (since this listing exists because the player is walking away
      // from the habit entirely, not upgrading) the seller is guaranteed the
      // payout automatically once the listing expires unsold.
      const { listingPrice, listedAt } = await this.createMarketplaceListing(user.id, habitBusiness, 'habit_deletion');

      // Deactivate the habit-business (soft delete to preserve history)
      // Note: Database trigger will automatically refund all stockholders at current stock price
      const { error: deleteError } = await this.supabase
        .from('habit_businesses')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (deleteError) {
        console.error('Error deleting habit business:', deleteError);
        throw deleteError;
      }

      // Business is now inactive, so its value has dropped out of net worth too — recalc from scratch.
      // Cash isn't credited yet, and the Weekly Receipt's business_sales row isn't logged
      // yet either — both happen at settlement time (purchase_marketplace_listing or
      // resolve_expired_marketplace_listings), whichever pays the seller first.
      await this.recalculateNetWorth(user.id);

      return { listingPrice, listedAt };
    } catch (error) {
      console.error('Error in deleteHabitBusiness:', error);
      throw error;
    }
  }

  /**
   * Complete a habit and earn money
   */
  /**
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  /**
   * Get date as YYYY-MM-DD string in user's local timezone
   * This ensures consistent date representation regardless of timezone differences
   */
  private getLocalDateString(date: Date = new Date()): string {
    // Use local timezone to get consistent YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Validate that the current date is not in the future relative to UTC
   * Prevents completing habits for future dates due to timezone differences
   */
  private validateNotFutureDate(): void {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const localToday = this.getLocalDateString(now);
    const utcToday = this.getLocalDateString(utcNow);
    
    // If local date is ahead of UTC date, we might be in a future timezone
    if (localToday > utcToday) {
      console.warn('⚠️ Local date appears to be ahead of UTC. Local:', localToday, 'UTC:', utcToday);
      // Allow completion if the difference is just one day (timezone difference)
      const localDate = new Date(localToday + 'T00:00:00');
      const utcDate = new Date(utcToday + 'T00:00:00');
      const daysDiff = Math.floor((localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        throw new Error('Cannot complete habits for future dates. Please check your device date/time settings.');
      }
    }
  }

  /**
   * Pure, cache-only replica of the progress/streak/earnings math completeHabit
   * performs against live DB state. Used offline to (a) reject a tap the same
   * way the server would ("goal already completed") without a network round
   * trip, since the cache is the only copy of "today's" progress we have, and
   * (b) compute the optimistic state to show immediately. Deliberately omits
   * the stock-ownership boost — that depends on other users' investor data,
   * which isn't available offline — so the provisional total can undercount
   * slightly versus what the real server replay produces; reconcileAfterSync()
   * corrects it once back online. Returns null if the period's goal is
   * already met (nothing to apply).
   */
  private previewCompletion(habit: HabitBusiness, occurredAt: string): {
    currentProgress: number;
    isGoalCompleted: boolean;
    newStreak: number;
    totalEarnings: number;
    completionTime: Date;
  } | null {
    const now = new Date(occurredAt);
    const interval = this.habitIntervalService.resolveInterval(habit);
    const periodStart = this.habitIntervalService.getCurrentPeriodStart(interval, now);

    let currentProgress = habit.current_progress || 0;
    if (habit.last_completed_at && new Date(habit.last_completed_at) < periodStart) {
      currentProgress = 0;
    }

    const goalValue = habit.goal_value || 1;
    if (currentProgress >= goalValue) return null;

    currentProgress += 1;
    const isGoalCompleted = currentProgress >= goalValue;

    // getEffectiveStreak already encodes "was the previous period's goal
    // actually met" from the fields a cached habit already carries — reuse
    // it rather than re-deriving that from a completions table we don't have.
    // This projection only depends on the *previous* period, so it's valid
    // on every tap of a multi-completion goal, not just the one that
    // happens to finish it — each tap needs it to earn its equal share of
    // the day's streak bonus (see totalEarnings below).
    const effectiveStreak = this.habitIntervalService.getEffectiveStreak(habit, now);
    const projectedStreak = effectiveStreak > 0 ? effectiveStreak + 1 : 1;
    const newStreak = isGoalCompleted ? projectedStreak : habit.streak;

    const baseEarnings = habit.earnings_per_completion;
    const streakMultiplier = projectedStreak > 1 ? Math.min((projectedStreak - 1) * 0.1, 1) : 0;
    const totalEarnings = baseEarnings + baseEarnings * streakMultiplier;

    return { currentProgress, isGoalCompleted, newStreak, totalEarnings, completionTime: now };
  }

  /** Applies a previewCompletion() result to the local cache (habit + profile cash) so the UI updates immediately while offline. */
  private async applyOptimisticCompletion(habit: HabitBusiness, preview: NonNullable<ReturnType<HabitBusinessService['previewCompletion']>>): Promise<void> {
    await this.habitCache.patchHabit(habit.id, {
      current_progress: preview.currentProgress,
      streak: preview.isGoalCompleted ? preview.newStreak : habit.streak,
      total_completions: habit.total_completions + 1,
      total_earnings: habit.total_earnings + preview.totalEarnings,
      last_completed_at: preview.completionTime.toISOString(),
      updated_at: preview.completionTime.toISOString(),
    });
    await this.habitCache.adjustProfileCash(preview.totalEarnings);
  }

  async completeHabit(habitBusinessId: string, occurredAt: string = new Date().toISOString()): Promise<{ earnings: number; streak: number }> {
    if (this.offlineQueue.isOffline()) {
      const cachedHabit = (await this.habitCache.getHabits()).find(h => h.id === habitBusinessId);
      if (!cachedHabit) {
        throw new Error("This habit isn't available offline yet — open it once while connected first.");
      }
      const preview = this.previewCompletion(cachedHabit, occurredAt);
      if (!preview) {
        const errorMsg = `Goal already completed! ${cachedHabit.current_progress}/${cachedHabit.goal_value || 1} done.`;
        await this.showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }
      await this.habitCache.pushPendingDelta(habitBusinessId, {
        earnings: preview.totalEarnings,
        previousStreak: cachedHabit.streak,
        previousProgress: cachedHabit.current_progress || 0,
        previousTotalCompletions: cachedHabit.total_completions,
        previousTotalEarnings: cachedHabit.total_earnings,
        previousLastCompletedAt: cachedHabit.last_completed_at || null,
      });
      await this.applyOptimisticCompletion(cachedHabit, preview);
      await this.offlineQueue.enqueue('completeHabit', [habitBusinessId, occurredAt], `Complete "${cachedHabit.business_name}"`);
      throw new OfflineQueuedError("You're offline — this completion will sync automatically once you're back online.");
    }
    try {
      // Validate that we're not trying to complete a habit for a future date
      this.validateNotFutureDate();

      // The rest of the completion (period/streak resolution, stock-boost +
      // streak-bonus earnings, dividends, stock price, milestones, atomic
      // cash credit) now runs server-side as one transaction in the
      // complete_habit_business RPC (see the migration of the same name) —
      // this used to be 5+ sequential, non-atomic calls here. Postgres has
      // no notion of the device's timezone, so it's passed explicitly and
      // the RPC resolves "local midnight" period boundaries against it,
      // matching HabitIntervalService's own local-time semantics.
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await this.supabase.rpc('complete_habit_business', {
        p_habit_business_id: habitBusinessId,
        p_occurred_at: occurredAt,
        p_client_timezone: clientTimezone,
      });

      if (error) {
        const isAlreadyCompleted = error.message?.includes('already completed') || error.message?.includes('Goal already completed');
        if (isAlreadyCompleted) {
          await this.showErrorToast(error.message);
        }
        throw new Error(error.message);
      }

      return { earnings: data.earnings, streak: data.streak };

    } catch (error) {
      console.error('Error in completeHabit:', error);
      // Only show generic error if we haven't already shown a specific one
      if (error instanceof Error &&
          !error.message.includes('already completed') &&
          !error.message.includes('Goal already completed')) {
        await this.showErrorToast('Failed to complete habit. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Complete a habit for YESTERDAY (backdated one day).
   * Available for '24h' habits, and for 'specific_days' habits when yesterday
   * was one of their scheduled days — in both cases only when goal_value === 1
   * and it wasn't already completed yesterday. Pays earnings, updates streak,
   * and distributes dividends to stockholders — all at yesterday's rate.
   */
  /** Cache-only replica of completeHabitYesterday's validation + streak/earnings math (see previewCompletion for why the stock boost is omitted). */
  private previewCompletionYesterday(habit: HabitBusiness, occurredAt: string): {
    newStreak: number;
    totalEarnings: number;
    completionTime: Date;
  } | null {
    const now = new Date(occurredAt);
    const interval = this.habitIntervalService.resolveInterval(habit);

    const yesterdayStart = this.habitIntervalService.getPreviousPeriodStart('24h', now);
    const todayStart = this.habitIntervalService.getCurrentPeriodStart('24h', now);
    const dayBeforeYesterdayStart = new Date(yesterdayStart.getTime() - 24 * 60 * 60 * 1000);

    if (interval === 'specific_days') {
      const activeDays = habit.active_days || [];
      if (!activeDays.includes(yesterdayStart.getDay())) return null; // yesterday wasn't a scheduled day
    } else if (interval !== '24h') {
      return null;
    }

    if (habit.last_completed_at) {
      const lastCompleted = new Date(habit.last_completed_at);
      if (lastCompleted >= yesterdayStart && lastCompleted < todayStart) return null; // already completed yesterday
    }

    const previousPeriodStart = interval === 'specific_days'
      ? this.habitIntervalService.getPreviousActiveDayStart(habit.active_days || [], yesterdayStart)
      : dayBeforeYesterdayStart;

    let newStreak = 1;
    if (habit.last_completed_at) {
      const lastCompleted = new Date(habit.last_completed_at);
      newStreak = (lastCompleted >= previousPeriodStart && lastCompleted < yesterdayStart)
        ? (habit.streak || 0) + 1
        : 1;
    }

    const baseEarnings = habit.earnings_per_completion;
    const streakMultiplier = newStreak > 1 ? Math.min((newStreak - 1) * 0.1, 1) : 0;
    const totalEarnings = baseEarnings + baseEarnings * streakMultiplier;

    const yesterdayDateString = this.getLocalDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const completionTime = new Date(`${yesterdayDateString}T18:00:00`);

    return { newStreak, totalEarnings, completionTime };
  }

  async completeHabitYesterday(habitBusinessId: string, occurredAt: string = new Date().toISOString()): Promise<void> {
    if (this.offlineQueue.isOffline()) {
      const cachedHabit = (await this.habitCache.getHabits()).find(h => h.id === habitBusinessId);
      if (!cachedHabit) {
        throw new Error("This habit isn't available offline yet — open it once while connected first.");
      }
      const preview = this.previewCompletionYesterday(cachedHabit, occurredAt);
      if (!preview) {
        const errorMsg = 'This habit was already completed yesterday, or is not a daily habit!';
        await this.showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }
      await this.habitCache.pushPendingDelta(habitBusinessId, {
        earnings: preview.totalEarnings,
        previousStreak: cachedHabit.streak,
        previousProgress: cachedHabit.current_progress || 0,
        previousTotalCompletions: cachedHabit.total_completions,
        previousTotalEarnings: cachedHabit.total_earnings,
        previousLastCompletedAt: cachedHabit.last_completed_at || null,
      });
      await this.habitCache.patchHabit(habitBusinessId, {
        streak: preview.newStreak,
        total_completions: cachedHabit.total_completions + 1,
        total_earnings: cachedHabit.total_earnings + preview.totalEarnings,
        last_completed_at: preview.completionTime.toISOString(),
        updated_at: new Date(occurredAt).toISOString(),
      });
      await this.habitCache.adjustProfileCash(preview.totalEarnings);
      await this.offlineQueue.enqueue('completeHabitYesterday', [habitBusinessId, occurredAt], `Complete "${cachedHabit.business_name}" for yesterday`);
      throw new OfflineQueuedError("You're offline — this will sync automatically once you're back online.");
    }
    try {
      // The rest of backdated completion (period/streak resolution, stock-
      // boost + streak-bonus earnings, dividends, stock price, atomic cash
      // credit) now runs server-side as one transaction in the
      // complete_habit_business_yesterday RPC (see the migration of the same
      // name) — this used to be 6+ sequential, non-atomic calls here, same
      // as completeHabit() before its own migration to complete_habit_business.
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { error } = await this.supabase.rpc('complete_habit_business_yesterday', {
        p_habit_business_id: habitBusinessId,
        p_occurred_at: occurredAt,
        p_client_timezone: clientTimezone,
      });

      if (error) {
        if (error.message?.includes('already completed')) {
          await this.showErrorToast(error.message);
        }
        throw new Error(error.message);
      }

    } catch (error) {
      console.error('Error in completeHabitYesterday:', error);
      if (error instanceof Error && !error.message.includes('already completed')) {
        await this.showErrorToast('Failed to complete habit for yesterday. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Undo a habit completion for today
   */
  async undoHabitCompletion(habitBusinessId: string, occurredAt: string = new Date().toISOString()): Promise<{ earnings: number }> {
    if (this.offlineQueue.isOffline()) {
      // If the completion being undone hasn't synced yet (it's still sitting
      // in the offline queue from earlier this session), there's nothing to
      // reverse server-side — just cancel it out locally instead of queuing
      // a second mutation to undo the first once both eventually replay.
      const cancelled =
        (await this.offlineQueue.cancelLastQueued('completeHabit', args => args[0] === habitBusinessId)) ??
        (await this.offlineQueue.cancelLastQueued('completeHabitYesterday', args => args[0] === habitBusinessId));

      if (cancelled) {
        const delta = await this.habitCache.popPendingDelta(habitBusinessId);
        if (delta) {
          await this.habitCache.patchHabit(habitBusinessId, {
            streak: delta.previousStreak,
            current_progress: delta.previousProgress,
            total_completions: delta.previousTotalCompletions,
            total_earnings: delta.previousTotalEarnings,
            last_completed_at: delta.previousLastCompletedAt ?? undefined,
          });
          await this.habitCache.adjustProfileCash(-delta.earnings);
          return { earnings: delta.earnings };
        }
        return { earnings: 0 };
      }

      // Nothing queued to cancel — this completion was already synced before
      // we went offline, so reversing it needs the real record server-side to
      // get the *exact* earnings (e.g. any stock-ownership boost baked into
      // that specific completion). We don't have that record locally, so we
      // approximate it the same way previewCompletion() does — base pay plus
      // the streak bonus, minus any stock boost — and apply it immediately so
      // the card and cash don't sit in "done"/overpaid for the rest of the
      // offline session; reconcileAfterSync() corrects the small remainder
      // once back online.
      const cachedHabit = (await this.habitCache.getHabits()).find(h => h.id === habitBusinessId);
      if (cachedHabit) {
        const goalValue = cachedHabit.goal_value || 1;
        const wasGoalCompletingTap = (cachedHabit.current_progress || 0) >= goalValue;
        const baseEarnings = cachedHabit.earnings_per_completion;
        // Every tap of a multi-completion goal earns an equal share of the day's
        // streak bonus, not just the goal-completing one (see previewCompletion) —
        // so the projected streak is needed here too, not just cachedHabit.streak
        // as-is, which for a non-final tap is still last period's (un-incremented) value.
        const effectiveStreak = this.habitIntervalService.getEffectiveStreak(cachedHabit, new Date(occurredAt));
        const projectedStreak = wasGoalCompletingTap ? cachedHabit.streak : (effectiveStreak > 0 ? effectiveStreak + 1 : 1);
        const streakMultiplier = projectedStreak > 1 ? Math.min((projectedStreak - 1) * 0.1, 1) : 0;
        const approxEarnings = baseEarnings + baseEarnings * streakMultiplier;

        await this.habitCache.patchHabit(habitBusinessId, {
          current_progress: Math.max(0, (cachedHabit.current_progress || 0) - 1),
          total_completions: Math.max(0, cachedHabit.total_completions - 1),
          total_earnings: Math.max(0, cachedHabit.total_earnings - approxEarnings),
          streak: wasGoalCompletingTap ? Math.max(0, cachedHabit.streak - 1) : cachedHabit.streak,
        });
        await this.habitCache.adjustProfileCash(-approxEarnings);
      }
      await this.offlineQueue.enqueue('undoHabitCompletion', [habitBusinessId, occurredAt], `Undo "${cachedHabit?.business_name ?? 'habit'}" completion`);
      throw new OfflineQueuedError("You're offline — this undo will sync automatically once you're back online.");
    }
    try {
      // The rest of undo (finding today's completion, streak/stats reversal,
      // atomic cash removal, completion delete) now runs server-side as one
      // transaction in the undo_habit_business_completion RPC (see the
      // migration of the same name) — this used to be 4+ sequential,
      // non-atomic calls here, whose completion-delete failure was silently
      // swallowed because by that point cash/stats had already been
      // irrevocably committed as separate prior statements. Atomicity means
      // a failure anywhere now rolls back the whole undo instead of leaving
      // a stale completion row behind.
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await this.supabase.rpc('undo_habit_business_completion', {
        p_habit_business_id: habitBusinessId,
        p_occurred_at: occurredAt,
        p_client_timezone: clientTimezone,
      });

      if (error) throw new Error(error.message);

      return { earnings: data.earnings };

    } catch (error) {
      console.error('Error in undoHabitCompletion:', error);
      throw error;
    }
  }

  /**
   * Get today's habits that can be completed
   */
  async getTodaysHabits(userId: string): Promise<HabitBusiness[]> {
    try {
      const today = this.getLocalDateString();

      const { data, error } = await this.supabase
        .from('habit_businesses')
        .select(`
          *,
          business_types (
            id,
            name,
            icon,
            base_cost,
            base_pay,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching today\'s habits:', error);
        throw error;
      }

      await this.habitCache.setHabits(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getTodaysHabits:', error);
      const cached = await this.habitCache.getHabits();
      if (cached.length > 0) return cached;
      throw error;
    }
  }

  /**
   * Manually process dividends when RPC function fails
   */
  async processDividendsManually(habitBusinessId: string, stockBoostAmount: number, stockId: string, baseEarnings: number = 0): Promise<void> {
    try {

      // Get stock holdings for this business
      const { data: holdings, error: holdingsError } = await this.supabase
        .from('stock_holdings')
        .select('*')
        .eq('stock_id', stockId)
        .gt('shares_owned', 0);

      if (holdingsError) {
        throw holdingsError;
      }

      if (!holdings || holdings.length === 0) {
        return;
      }

      // The business is cut into 100 shares (80 owner / 20 tradeable). Every
      // one of them is worth 1/100th of whatever the owner actually made
      // from this completion (base pay + stock boost + streak bonus, all
      // folded into baseEarnings by the caller) — stockBoostAmount is kept
      // for informational recording only. Mirrors process_habit_completion_dividends.
      const completeIncome = baseEarnings;
      const dividendPerShare = completeIncome / 100;

      const totalSharesHeld = holdings.reduce((sum, holding) => sum + holding.shares_owned, 0);

      if (dividendPerShare <= 0 || totalSharesHeld <= 0) {
        return;
      }
      
      // Distribute dividends to each stockholder
      for (const holding of holdings) {
        const dividendAmount = holding.shares_owned * dividendPerShare;
        
        // Record dividend distribution
        const { error: distributionError } = await this.supabase
          .from('stock_dividend_distributions')
          .insert({
            dividend_payment_id: crypto.randomUUID(),
            stockholder_id: holding.holder_id,
            shares_owned: holding.shares_owned,
            dividend_per_share: dividendPerShare,
            total_dividend: dividendAmount
          });
          
        if (distributionError) {
          console.error('Error recording dividend distribution:', distributionError);
          continue;
        }
        
        // Update stockholder's cash
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('cash')
          .eq('id', holding.holder_id)
          .single();

        if (profileError || !profile) {
          console.error('Error getting stockholder profile:', profileError);
          continue;
        }

        const newCash = profile.cash + dividendAmount;

        const { error: updateError } = await this.supabase
          .from('user_profiles')
          .update({
            cash: newCash,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.holder_id);

        if (updateError) {
          console.error('Error updating stockholder cash:', updateError);
          continue;
        }

        await this.recalculateNetWorth(holding.holder_id);
        
        // Update holding's total dividends earned
        const { error: holdingUpdateError } = await this.supabase
          .from('stock_holdings')
          .update({
            total_dividends_earned: holding.total_dividends_earned + dividendAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', holding.id);
          
        if (holdingUpdateError) {
          console.error('Error updating holding dividends:', holdingUpdateError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in manual dividend processing:', error);
      throw error;
    }
  }

  /**
   * Sell stock shares
   */
  async sellStockShares(stockId: string, sharesToSell: number): Promise<any> {
    if (this.offlineQueue.isOffline()) {
      await this.offlineQueue.enqueue('sellStockShares', [stockId, sharesToSell], `Sell ${sharesToSell} share${sharesToSell === 1 ? '' : 's'}`);
      throw new OfflineQueuedError("You're offline — this sale will sync automatically once you're back online.");
    }
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase.rpc('sell_stock_shares', {
        seller_id: currentUser.user.id,
        stock_uuid: stockId,
        shares_to_sell: sharesToSell
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error selling stock shares:', error);
      throw error;
    }
  }

  /**
   * Update stock price based on current streak
   */
  async updateStockPrice(habitBusinessId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('update_stock_price_by_streak', {
        habit_business_uuid: habitBusinessId
      });

      if (error) {
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Error updating stock price:', error);
      throw error;
    }
  }

  /**
   * Get user's stock holdings
   */
  async getUserStockHoldings(userId: string): Promise<StockHolding[]> {
    try {
      const { data, error } = await this.supabase
        .from('stock_holdings')
        .select(`
          *,
          business_stocks (
            id,
            habit_business_id,
            business_owner_id,
            current_stock_price,
            total_shares_issued,
            shares_owned_by_owner,
            shares_available,
            price_multiplier,
            habit_businesses (
              id,
              business_name,
              business_icon,
              streak,
              is_active,
              business_types (
                name,
                icon
              )
            )
          )
        `)
        .eq('holder_id', userId)
        .gt('shares_owned', 0);

      if (error) {
        console.error('Error fetching stock holdings:', error);
        throw error;
      }

      // Filter out holdings for businesses that have been deleted (soft-deleted = is_active false)
      const active = (data || []).filter(
        h => h.business_stocks?.habit_businesses?.is_active !== false
      );
      return active;
    } catch (error) {
      console.error('Error in getUserStockHoldings:', error);
      throw error;
    }
  }

  /**
   * Batch-fetch the stock ownership pay-boost percentage for a set of habit businesses.
   * Each of the (up to 20) tradeable shares actually purchased by other investors adds
   * 1% to the owner's base pay, so the returned value is directly a percentage (0-20).
   */
  async getStockOwnershipBoosts(habitBusinessIds: string[]): Promise<{ [habitBusinessId: string]: number }> {
    const boosts: { [habitBusinessId: string]: number } = {};
    if (habitBusinessIds.length === 0) return boosts;

    try {
      const { data, error } = await this.supabase
        .from('business_stocks')
        .select('habit_business_id, shares_owned_by_owner, shares_available, total_shares_issued')
        .in('habit_business_id', habitBusinessIds);

      if (error || !data) return boosts;

      for (const stock of data) {
        const tradeableShares = stock.total_shares_issued - stock.shares_owned_by_owner;
        const sharesSoldToInvestors = tradeableShares - stock.shares_available;
        boosts[stock.habit_business_id] = Math.max(0, sharesSoldToInvestors);
      }
    } catch (error) {
      console.error('Error in getStockOwnershipBoosts:', error);
    }

    return boosts;
  }

  /**
   * Get everyone who owns shares of a business's stock — the business owner's
   * retained shares plus every investor's holding — sorted by shares owned
   * (descending). Uses a SECURITY DEFINER RPC since stock_holdings' RLS only
   * lets a user see their own holdings or holdings of businesses they own.
   */
  async getStockOwners(habitBusinessId: string): Promise<StockOwner[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_stock_owners', {
        business_id_param: habitBusinessId
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        name: row.owner_name || 'Unknown',
        sharesOwned: row.shares_owned,
        isBusinessOwner: row.is_business_owner
      }));
    } catch (error) {
      console.error('Error in getStockOwners:', error);
      return [];
    }
  }

  /**
   * Get available stocks for purchase
   */
  async getAvailableStocks(userId: string): Promise<BusinessStock[]> {
    try {
      const [{ data, error }, { data: coOwnedRows }] = await Promise.all([
        this.supabase
          .from('business_stocks')
          .select(`
            *,
            habit_businesses (
              id,
              business_name,
              business_icon,
              streak,
              user_id,
              is_joint_venture,
              business_types (
                name,
                icon
              )
            )
          `)
          .gt('shares_available', 0)
          .neq('business_owner_id', userId), // Don't show user's own stocks
        // Joint ventures: business_owner_id is always the creator, so a
        // non-creator co-owner isn't caught by the .neq() above — exclude
        // any business this user co-owns too. (Server-side, purchase_stock_shares
        // hard-blocks this regardless — this is just so the UI doesn't offer
        // a purchase that would be rejected.)
        this.supabase.from('business_co_owners').select('habit_business_id').eq('user_id', userId)
      ]);

      if (error) {
        console.error('Error fetching available stocks:', error);
        throw error;
      }

      const ownCoOwnedIds = new Set((coOwnedRows || []).map((r: any) => r.habit_business_id));
      return (data || []).filter((stock: any) => !ownCoOwnedIds.has(stock.habit_businesses?.id));
    } catch (error) {
      console.error('Error in getAvailableStocks:', error);
      throw error;
    }
  }

  /**
   * Purchase stock shares
   */
  async purchaseStock(stockId: string, shares: number): Promise<void> {
    try {
      // Delegate to the atomic purchase_stock_shares RPC (same one
      // purchaseStockShares() uses) instead of the old multi-step
      // read-then-write client logic, which was vulnerable to a lost-update
      // race on cash/shares_available under concurrent purchases.
      await this.purchaseStockShares(stockId, shares);

      // Success message
      await this.showSuccessToast(`✅ Purchased ${shares} shares successfully!`);

    } catch (error) {
      console.error('Error in purchaseStock:', error);
      // Queued-for-offline-replay isn't a failure — the caller shows its
      // own message for it — so skip the generic error toast here.
      if (error instanceof OfflineQueuedError) {
        throw error;
      }
      // Only show generic error if we haven't already shown a specific one
      if (error instanceof Error &&
          !error.message.includes('Insufficient funds') &&
          !error.message.includes('Not enough shares')) {
        await this.showErrorToast(error instanceof Error ? error.message : 'Failed to purchase stock. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Get today's actual earnings from completed habits
   */
  async getTodaysActualEarnings(userId: string): Promise<number> {
    try {
      // Use local date string to avoid timezone issues
      const todayLocalDateString = this.getLocalDateString(new Date());
      
      const { data, error } = await this.supabase
        .from('habit_completions')
        .select('earnings, completed_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching today\'s actual earnings:', error);
        throw error;
      }

      // Filter completions to only include today's using local date comparison
      const todayCompletions = data?.filter(completion => {
        const completionLocalDate = this.getLocalDateString(new Date(completion.completed_at));
        return completionLocalDate === todayLocalDateString;
      }) || [];

      const totalEarnings = todayCompletions.reduce((total, completion) => total + completion.earnings, 0);
      
      return totalEarnings;
    } catch (error) {
      console.error('Error in getTodaysActualEarnings:', error);
      throw error;
    }
  }

  /**
   * Get today's stock dividend earnings for a user
   */
  async getTodaysStockDividends(userId: string): Promise<number> {
    try {
      // Get today's date range in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('stock_dividend_distributions')
        .select('total_dividend, created_at')
        .eq('stockholder_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (error) {
        console.error('Error fetching today\'s stock dividends:', error);
        throw error;
      }

      const totalDividends = data?.reduce((total, distribution) => total + distribution.total_dividend, 0) || 0;
      
      // Debug: Show each individual dividend payment
      if (data && data.length > 0) {
        data.forEach((payment, index) => {
        });
      }
      
      // For debugging: also check if user has any stock holdings that should generate dividends
      try {
        const holdings = await this.getUserStockHoldings(userId);
        if (holdings.length > 0) {
        } else {
        }
      } catch (holdingsError) {
        console.warn('Could not fetch holdings for dividend debugging:', holdingsError);
      }
      
      return totalDividends;
    } catch (error) {
      console.error('Error in getTodaysStockDividends:', error);
      throw error;
    }
  }

  /**
   * Debug method to get comprehensive information about the dividend system
   */
  async getDividendSystemDebugInfo(userId: string): Promise<{
    userHoldings: any[],
    ownedBusinessStocks: any[],
    todaysDividends: number,
    recentDividendDistributions: any[]
  }> {
    try {
      // Get user's stock holdings
      const userHoldings = await this.getUserStockHoldings(userId);
      
      // Get stocks for businesses owned by this user
      const { data: ownedBusinessStocks } = await this.supabase
        .from('business_stocks')
        .select(`
          *,
          habit_businesses!inner (
            id,
            business_name,
            user_id
          )
        `)
        .eq('habit_businesses.user_id', userId);
      
      // Get today's dividends
      const todaysDividends = await this.getTodaysStockDividends(userId);
      
      // Get recent dividend distributions
      const { data: recentDistributions } = await this.supabase
        .from('stock_dividend_distributions')
        .select('*')
        .eq('stockholder_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      return {
        userHoldings: userHoldings || [],
        ownedBusinessStocks: ownedBusinessStocks || [],
        todaysDividends,
        recentDividendDistributions: recentDistributions || []
      };
    } catch (error) {
      console.error('Error getting dividend debug info:', error);
      throw error;
    }
  }

  /**
   * Create a test dividend distribution for debugging (dev mode only)
   */
  async createTestDividend(userId: string, amount: number = 5.0): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('stock_dividend_distributions')
        .insert({
          dividend_payment_id: `test-${Date.now()}`,
          stockholder_id: userId,
          shares_owned: 10,
          dividend_per_share: amount / 10,
          total_dividend: amount
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Error creating test dividend:', error);
      throw error;
    }
  }

  /**
   * Reset daily habits that are outdated (completed before today)
   * This ensures that habits completed yesterday show as incomplete today
   */
  async resetOutdatedDailyHabits(): Promise<void> {
    try {
      
      // First, clean up any future date completions that shouldn't exist
      await this.cleanupInvalidCompletions();
      
      const { data, error } = await this.supabase
        .rpc('reset_outdated_habits');

      if (error) {
        console.error('Error resetting outdated daily habits:', error);
        // Don't throw error - this is a nice-to-have feature, not critical
        return;
      }

      if (data && data.length > 0) {
        
        // Update stock prices for habits that had their streaks reset
        for (const resetHabit of data) {
          try {
            await this.supabase.rpc('update_stock_price_by_streak', {
              habit_business_uuid: resetHabit.id
            });
          } catch (priceError) {
            console.error(`⚠️ Failed to update stock price for habit ${resetHabit.id}:`, priceError);
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error in resetOutdatedDailyHabits:', error); // method kept for backwards compat
      // Don't throw error - this is a nice-to-have feature
    }
  }

  /**
   * Clean up invalid completion records (future dates, timezone issues)
   */
  private async cleanupInvalidCompletions(): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) return;

      const now = new Date();
      // Be more strict: anything beyond today should be cleaned up
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      // Find and remove completion records that are in the future
      const { data: futureCompletions, error: queryError } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, habit_business_id')
        .eq('user_id', user.id)
        .gt('completed_at', endOfToday.toISOString());

      if (queryError) {
        console.error('Error querying future completions:', queryError);
        return;
      }

      if (futureCompletions && futureCompletions.length > 0) {
        
        // Delete the invalid records
        const { error: deleteError } = await this.supabase
          .from('habit_completions')
          .delete()
          .in('id', futureCompletions.map(c => c.id));

        if (deleteError) {
          console.error('Error deleting future completions:', deleteError);
        } else {
          
          // Reset the progress for affected habit businesses
          const affectedBusinessIds = [...new Set(futureCompletions.map(c => c.habit_business_id))];
          for (const businessId of affectedBusinessIds) {
            if (businessId) {
              const { error: resetError } = await this.supabase
                .from('habit_businesses')
                .update({ 
                  current_progress: 0,
                  updated_at: new Date().toISOString()
                })
                .eq('id', businessId);
              
              if (resetError) {
                console.error('Error resetting progress for business:', businessId, resetError);
              }
            }
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error in cleanupInvalidCompletions:', error);
    }
  }

  /**
   * Debug function to inspect habit state and completion records
   */
  async debugHabitState(habitBusinessId: string): Promise<any> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get habit business details
      const { data: habitBusiness, error: habitError } = await this.supabase
        .from('habit_businesses')
        .select('*')
        .eq('id', habitBusinessId)
        .eq('user_id', user.id)
        .single();

      // Get today's date info
      const now = new Date();
      const todayLocalString = this.getLocalDateString(now);
      const todayUTCString = now.toISOString().split('T')[0];
      
      // Get ALL completion records for this habit
      const { data: allCompletions, error: completionsError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      // Check for today's completions specifically
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      const { data: todayCompletions, error: todayError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .gte('completed_at', todayStart.toISOString())
        .lte('completed_at', todayEnd.toISOString());

      // Check completions using date string comparison
      const todayCompletionsByDate = allCompletions?.filter(completion => {
        const completionDate = this.getLocalDateString(new Date(completion.completed_at));
        return completionDate === todayLocalString;
      });

      // Calculate what the UI methods would return
      const isCompletedResult = this.isCompletedTodayDebug(habitBusiness);
      const isGoalCompletedResult = this.isGoalCompletedDebug(habitBusiness);

      return {
        habitBusiness,
        dateInfo: {
          now: now.toString(),
          todayLocal: todayLocalString,
          todayUTC: todayUTCString,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        allCompletions,
        todayCompletions,
        todayCompletionsByDate,
        uiResults: {
          isCompletedToday: isCompletedResult,
          isGoalCompleted: isGoalCompletedResult
        }
      };

    } catch (error) {
      console.error('❌ Error in debugHabitState:', error);
      throw error;
    }
  }

  /**
   * Debug version of isCompletedToday that logs its logic
   */
  private isCompletedTodayDebug(habitBusiness: any): boolean {
    
    if (!habitBusiness?.last_completed_at) {
      return false;
    }
    
    const goalValue = habitBusiness.goal_value || 1;
    const currentProgress = habitBusiness.current_progress || 0;
    
    // Check if goal is fully completed
    if (goalValue > 1 && currentProgress < goalValue) {
      return false;
    }
    
    // Check if progress is 0
    if (currentProgress === 0) {
      return false;
    }
    
    if (habitBusiness.frequency === 'daily') {
      const today = new Date();
      const todayString = this.getLocalDateString(today);
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      
      return completionString === todayString;
    }
    
    return false;
  }

  /**
   * Debug version of isGoalCompleted that logs its logic
   */
  private isGoalCompletedDebug(habitBusiness: any): boolean {
    
    const goalValue = habitBusiness?.goal_value || 1;
    const currentProgress = habitBusiness?.current_progress || 0;
    
    // First check if the progress meets the goal
    if (currentProgress < goalValue) {
      return false;
    }
    
    if (!habitBusiness?.last_completed_at) {
      return false;
    }
    
    if (habitBusiness.frequency === 'daily') {
      const today = new Date();
      const todayString = this.getLocalDateString(today);
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = this.getLocalDateString(completionDate);
      
      return completionString === todayString;
    }
    
    return false;
  }

  /**
   * Emergency cleanup function to remove duplicate/invalid completions for a specific habit
   */
  async cleanupHabitCompletions(habitBusinessId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) return;

      // Get all completions for this habit
      const { data: allCompletions, error: queryError } = await this.supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_business_id', habitBusinessId)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      if (queryError) {
        console.error('Error fetching completions:', queryError);
        return;
      }

      if (!allCompletions || allCompletions.length === 0) {
        return;
      }

      // Group by date and keep only the first completion per day
      const completionsByDate = new Map<string, any>();
      const duplicatesToDelete: string[] = [];

      for (const completion of allCompletions) {
        const dateKey = this.getLocalDateString(new Date(completion.completed_at)); // Get YYYY-MM-DD in user's local timezone
        
        if (completionsByDate.has(dateKey)) {
          // This is a duplicate - mark for deletion
          duplicatesToDelete.push(completion.id);
        } else {
          completionsByDate.set(dateKey, completion);
        }
      }

      // Delete duplicates
      if (duplicatesToDelete.length > 0) {
        const { error: deleteError } = await this.supabase
          .from('habit_completions')
          .delete()
          .in('id', duplicatesToDelete);

        if (deleteError) {
          console.error('Error deleting duplicates:', deleteError);
        } else {
        }
      }

      // Calculate correct current_progress based on today's remaining completions
      const today = this.getLocalDateString();
      const todayCompletions = Array.from(completionsByDate.entries())
        .filter(([dateKey, completion]) => dateKey === today);
      
      const correctProgress = todayCompletions.length;
      
      const { error: updateError } = await this.supabase
        .from('habit_businesses')
        .update({ 
          current_progress: correctProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitBusinessId);

      if (updateError) {
        console.error('Error updating habit progress:', updateError);
      } else {
      }

    } catch (error) {
      console.error('Error in cleanupHabitCompletions:', error);
    }
  }

  /**
   * Check which habits need reset for a specific user (for debugging)
   */
  async checkUserHabitsNeedReset(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_user_habits_need_reset', { user_uuid: userId });

      if (error) {
        console.error('Error checking user habits reset status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in checkUserHabitsNeedReset:', error);
      return [];
    }
  }

  /**
   * Get friend businesses for the stocks page
   */
  async getFriendBusinesses(userId: string): Promise<any[]> {
    try {
      // Use the new SQL function to get friend businesses optimized for stocks
      const { data, error } = await this.supabase
        .rpc('get_friend_businesses_for_stocks', { user_uuid: userId });

      if (error) {
        console.error('Error loading friend businesses for stocks:', error);
        return [];
      }

      // Format for the frontend
      return (data || []).map((business: any) => ({
        id: business.business_id,
        businessName: business.business_name,
        businessIcon: business.business_icon,
        ownerName: business.owner_name,
        ownerId: business.owner_id,
        streak: business.streak || 0,
        frequency: business.frequency,
        goalValue: business.goal_value || 1,
        currentProgress: business.current_progress || 0,
        earningsPerCompletion: business.earnings_per_completion || 0,
        // Stock information
        stockId: business.stock_id,
        stockPrice: business.stock_price,
        basePrice: business.base_price || 100,
        priceMultiplier: business.price_multiplier || 1.0,
        sharesAvailable: business.shares_available || 200,
        totalShares: business.total_shares || 1000,
        potentialDividend: business.potential_dividend || 0,
        lastCompletedAt: business.last_completed_at,
        recurrenceInterval: business.recurrence_interval,
        activeDays: business.active_days || []
      }));

    } catch (error) {
      console.error('Error in getFriendBusinesses:', error);
      return [];
    }
  }

  /**
   * Get user's stock portfolio
   */
  async getUserStockPortfolio(userId: string): Promise<any[]> {
    
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_stock_portfolio', { user_uuid: userId });

      if (error) {
        console.error('❌ Error loading stock portfolio:', error);
        console.error('❌ Error details:', error.message, error.code, error.hint);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        return [];
      }

      if (!data || data.length === 0) {
        // Let's check raw transactions instead of non-existent stock_holdings
        const { data: rawTransactions, error: transactionsError } = await this.supabase
          .from('stock_transactions')
          .select('*')
          .eq('buyer_id', userId)
          .eq('transaction_type', 'purchase');
        
        // Also check if RPC function works with direct SQL
        const { data: testData, error: testError } = await this.supabase
          .rpc('get_user_stock_portfolio', { user_uuid: 'cf12469a-d7a2-40ef-82ca-21e8ade1d69b' });
        
        return [];
      }

      const mappedData = (data || []).map((holding: any) => {
        return {
          id: holding.holding_id,
          stockId: holding.stock_id,
          businessId: holding.business_id, // Add the business ID
          businessName: holding.business_name,
          businessIcon: holding.business_icon,
          ownerName: holding.owner_name,
          ownerId: holding.owner_id || holding.business_owner_id, // Add owner ID
          sharesOwned: holding.shares_owned,
          averagePurchasePrice: holding.average_purchase_price,
          basePrice: holding.base_price,
          currentPrice: holding.current_stock_price,
          totalInvested: holding.total_invested,
          currentValue: holding.current_value,
          profitLoss: holding.profit_loss,
          totalDividendsEarned: holding.total_dividends_earned,
          dailyDividendRate: holding.daily_dividend_rate,
          businessStreak: holding.business_streak,
          goalValue: holding.goal_value || 1,
          currentProgress: holding.current_progress || 0,
          lastCompletedAt: holding.last_completed_at,
          recurrenceInterval: holding.recurrence_interval,
          activeDays: holding.active_days || [],
          lastPurchaseAt: holding.last_purchase_at
        };
      });
      
      return mappedData;

    } catch (error) {
      console.error('❌ Error in getUserStockPortfolio:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  /**
   * Purchase stock shares
   */
  async purchaseStockShares(stockId: string, shares: number): Promise<any> {
    if (this.offlineQueue.isOffline()) {
      await this.offlineQueue.enqueue('purchaseStockShares', [stockId, shares], `Buy ${shares} share${shares === 1 ? '' : 's'}`);
      throw new OfflineQueuedError("You're offline — this purchase will sync automatically once you're back online.");
    }
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('purchase_stock_shares', { 
          buyer_id: user.id, 
          stock_uuid: stockId, 
          shares_to_buy: shares 
        });

      if (error) {
        console.error('Error purchasing stock shares:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      return data;

    } catch (error) {
      console.error('Error in purchaseStockShares:', error);
      throw error;
    }
  }

  /**
   * Fix lemonade stock prices specifically (direct database update)
   */
  async fixLemonadeStockPrices(): Promise<void> {
    try {
      
      // First get lemonade habit business IDs
      const { data: lemonadeBusinesses, error: fetchError } = await this.supabase
        .from('habit_businesses')
        .select('id')
        .or('business_icon.eq.🍋,earnings_per_completion.eq.1.00')
        .eq('is_active', true);

      if (fetchError) {
        throw fetchError;
      }

      if (!lemonadeBusinesses || lemonadeBusinesses.length === 0) {
        return;
      }

      const businessIds = lemonadeBusinesses.map(b => b.id);

      // Direct update to fix lemonade stocks showing $100 instead of $1
      const { error: updateError } = await this.supabase
        .from('business_stocks')
        .update({
          current_stock_price: 1.00,
          price_multiplier: 1.0,
          last_price_update: new Date().toISOString()
        })
        .in('habit_business_id', businessIds);

      if (updateError) {
        throw updateError;
      }

    } catch (error) {
      console.error('Error in fixLemonadeStockPrices:', error);
      throw error;
    }
  }

  /**
   * Get habit completion history for the specified period
   * When days = 365, returns current calendar year data (Jan 1 - Dec 31)
   * Otherwise returns the last N days from today
   */
  async getHabitCompletionHistory(businessId: string, days: number = 30): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      
      let startDate: Date;
      let endDate: Date;
      
      if (days === 365) {
        // For full year view (365 days), show current calendar year
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1); // January 1st
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st end of day
      } else {
        // For other day counts, use the traditional "last N days" approach
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      // Get completion data - using correct column names from schema
      const { data: completions, error } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, streak_count, earnings, habit_business_id')
        .eq('habit_business_id', businessId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching habit completions:', error);
        return [];
      }

      // Create a complete date range
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      let currentStreak = 0;
      const todayStr = this.getLocalDateString(new Date());

      // Calculate total days in the range
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);

        // Check if there was a completion on this date (compare local calendar dates,
        // not raw UTC string prefixes, since completed_at now stores the real completion time)
        const completion = completions?.find(c =>
          c.completed_at && this.getLocalDateString(new Date(c.completed_at)) === dateStr
        );

        // Debug for current date or specific dates
        if (dateStr === todayStr || dateStr === '2025-08-20' || i < 5 || i >= totalDays - 5) {
        }

        const wasCompleted = !!completion;

        // Update streak - use the streak_count from the completion record if available
        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else if (dateStr === todayStr) {
          // Today's period isn't over yet — a missing completion today doesn't mean
          // the streak broke, it means the day is still in progress. Carry the
          // streak forward unchanged; it will correctly reset tomorrow if still missed.
        } else {
          currentStreak = 0;
        }

        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      const completedDates = dateRange.filter(d => d.completed);
      return dateRange;
    } catch (error) {
      console.error('💥 Error in getHabitCompletionHistory:', error);
      return [];
    }
  }

  /**
   * Get habit completion history for stocks - works across users for public stock data
   * This method uses a different approach that bypasses user restrictions for stock viewing
   */
  async getHabitCompletionHistoryForStock(businessId: string, days: number = 30): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      
      let startDate: Date;
      let endDate: Date;
      
      if (days === 365) {
        // For full year view (365 days), show current calendar year
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1); // January 1st
        endDate = new Date(currentYear, 11, 31, 23, 59, 59); // December 31st end of day
      } else {
        // For other day counts, use the traditional "last N days" approach
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      // Use RPC function to get completion history for stocks (bypasses RLS)
      
      const { data: completions, error } = await this.supabase
        .rpc('get_habit_completions_for_stock', {
          input_uuid: businessId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) {
        console.error('❌ Error fetching stock habit completions:', error);
        console.error('❌ Error details:', error.message, error.code, error.hint);
        // Fall back to direct query if RPC doesn't exist yet
        return this.getHabitCompletionHistoryFallback(businessId, startDate, endDate);
      }

      if (!completions || completions.length === 0) {
        console.warn('⚠️ No completion data returned for business:', businessId);
      }

      // Create date range array
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      let currentStreak = 0;
      const todayStr = this.getLocalDateString(new Date());

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);

        // Find completion for this date
        const completion = completions?.find((c: any) => {
          const completionDate = this.getLocalDateString(new Date(c.completed_at));
          return completionDate === dateStr;
        });

        const wasCompleted = !!completion;

        // Update streak
        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else if (dateStr === todayStr) {
          // Today's period isn't over yet — don't treat a missing completion
          // today as a break; carry the streak forward unchanged.
        } else {
          currentStreak = 0;
        }

        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      const completedDates = dateRange.filter(d => d.completed);
      return dateRange;

    } catch (error) {
      console.error('💥 Error in getHabitCompletionHistoryForStock:', error);
      // Fall back to regular method as last resort
      return this.getHabitCompletionHistory(businessId, days);
    }
  }

  /**
   * Calculate reasonable earnings per completion to prevent extreme values
   */
  private calculateReasonableEarnings(basePay: number, goalValue: number): number {
    if (!goalValue || goalValue <= 0) {
      return basePay; // Default to base pay if goal value is invalid
    }

    const calculatedEarnings = basePay / goalValue;
    
    // Apply reasonable bounds:
    // - Never more than base pay (prevents inflated earnings from tiny goals)
    // - Never less than 1% of base pay (prevents earnings too small to be meaningful)
    const maxEarnings = basePay;
    const minEarnings = Math.max(0.01, basePay * 0.01);
    
    return Math.min(maxEarnings, Math.max(minEarnings, calculatedEarnings));
  }

  /**
   * Fallback method for getting completion history when RPC is not available
   */
  private async getHabitCompletionHistoryFallback(businessId: string, startDate: Date, endDate: Date): Promise<{ date: string; completed: boolean; streakDay: number }[]> {
    try {
      
      // Try direct query (this might fail due to RLS but let's try)
      const { data: completions, error } = await this.supabase
        .from('habit_completions')
        .select('id, completed_at, streak_count, habit_business_id')
        .eq('habit_business_id', businessId)
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('❌ Fallback query failed:', error);
        return [];
      }

      // If no data found, return empty array
      if (!completions || completions.length === 0) {
        return [];
      }

      // Create date range array
      const dateRange: { date: string; completed: boolean; streakDay: number }[] = [];
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      let currentStreak = 0;
      const todayStr = this.getLocalDateString(new Date());

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = this.getLocalDateString(currentDate);

        const completion = completions?.find((c: any) => {
          const completionDate = this.getLocalDateString(new Date(c.completed_at));
          return completionDate === dateStr;
        });

        const wasCompleted = !!completion;

        if (wasCompleted) {
          currentStreak = completion.streak_count || currentStreak + 1;
        } else if (dateStr === todayStr) {
          // Today's period isn't over yet — don't treat a missing completion
          // today as a break; carry the streak forward unchanged.
        } else {
          currentStreak = 0;
        }

        dateRange.push({
          date: dateStr,
          completed: wasCompleted,
          streakDay: currentStreak
        });
      }

      return dateRange;

    } catch (error) {
      console.error('💥 Error in fallback method:', error);
      return [];
    }
  }

  /**
   * Update display order for multiple habit businesses (used for drag-and-drop reordering)
   */
  async updateHabitBusinessOrder(userId: string, orderedBusinessIds: string[]): Promise<void> {
    try {
      // Update each habit business with its new display_order
      const updates = orderedBusinessIds.map((businessId, index) => ({
        id: businessId,
        display_order: index + 1,
        user_custom_order: index + 1, // Also update custom order to preserve user's choice
        updated_at: new Date().toISOString()
      }));

      // Independent per-row updates — fire concurrently instead of one round trip per habit.
      await Promise.all(updates.map(async (update) => {
        const { error } = await this.supabase
          .from('habit_businesses')
          .update({
            display_order: update.display_order,
            user_custom_order: update.user_custom_order,
            updated_at: update.updated_at
          })
          .eq('id', update.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating habit business order:', error);
          throw error;
        }
      }));

    } catch (error) {
      console.error('❌ Error updating habit business order:', error);
      throw error;
    }
  }

  /**
   * Reset habits to their user custom order (called when new day/week starts)
   */
  async resetToCustomOrder(userId: string): Promise<void> {
    try {
      // Get all user's habits and reset display_order to match user_custom_order
      const habits = await this.getUserHabitBusinesses(userId);

      // Independent per-row updates — fire concurrently instead of one round trip per habit.
      await Promise.all(habits.map(async (habit) => {
        const { error } = await this.supabase
          .from('habit_businesses')
          .update({
            display_order: habit.user_custom_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', habit.id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error resetting individual habit to custom order:', error);
          throw error;
        }
      }));

    } catch (error) {
      console.error('❌ Error resetting to custom order:', error);
      throw error;
    }
  }

  /**
   * Check if a habit is completed for the current interval period.
   * Delegates to HabitIntervalService.
   */
  private isHabitCompleteForToday(habitBusiness: HabitBusiness): boolean {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }
}
