import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  seller_name: string;
  business_type_id: number;
  business_name: string;
  business_icon: string;
  base_cost: number;
  earnings_per_completion: number;
  base_sell_value: number;
  streak_at_listing: number;
  listing_price: number;
  reason: 'upgrade' | 'habit_deletion';
  created_at: string;
  listed_at: string;
  expires_at: string;
  is_own: boolean;
}

export interface MarketplacePurchaseResult {
  success: boolean;
  error?: string;
  purchase_id?: string;
  purchase_price?: number;
}

export interface MarketplacePurchase {
  id: string;
  listing_id: string;
  buyer_id: string;
  business_type_id: number;
  business_name: string;
  business_icon: string;
  base_cost: number;
  earnings_per_completion: number;
  purchase_price: number;
  streak_at_purchase: number;
  resolved: boolean;
  resolved_habit_business_id: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService.client;
  }

  /** Settle this user's own expired listings (guaranteed payout for habit-deletion listings, silent expiry for upgrade listings). Call once whenever the Marketplace tab is opened. */
  async resolveExpiredListings(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('resolve_expired_marketplace_listings', { p_user_id: userId });
    if (error) {
      console.error('Error resolving expired marketplace listings:', error);
      throw error;
    }
    return data as number;
  }

  /** Active listings visible to this user: their own, plus their accepted friends'. */
  async getListings(viewerId: string): Promise<MarketplaceListing[]> {
    const { data, error } = await this.supabase.rpc('get_friend_marketplace_listings', { p_viewer_id: viewerId });
    if (error) {
      console.error('Error loading marketplace listings:', error);
      throw error;
    }
    return data || [];
  }

  async purchaseListing(buyerId: string, listingId: string): Promise<MarketplacePurchaseResult> {
    const { data, error } = await this.supabase.rpc('purchase_marketplace_listing', {
      p_buyer_id: buyerId,
      p_listing_id: listingId
    });
    if (error) {
      console.error('Error purchasing marketplace listing:', error);
      throw error;
    }
    return data as MarketplacePurchaseResult;
  }

  /** Merge a purchased business into an existing one of equal-or-lower level. */
  async resolvePurchaseIntoExisting(buyerId: string, purchaseId: string, targetHabitBusinessId: string): Promise<string> {
    const { data, error } = await this.supabase.rpc('resolve_marketplace_purchase', {
      p_buyer_id: buyerId,
      p_purchase_id: purchaseId,
      p_target_habit_business_id: targetHabitBusinessId
    });
    if (error) {
      console.error('Error resolving marketplace purchase into existing business:', error);
      throw error;
    }
    return data as string;
  }

  /** Start a brand-new habit around a purchased business — no inherited streak/stockholders. */
  async resolvePurchaseIntoNewHabit(
    buyerId: string,
    purchaseId: string,
    businessName: string,
    habitDescription: string,
    recurrenceInterval: '24h' | 'specific_days',
    goalValue: number,
    activeDays?: number[]
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('resolve_marketplace_purchase', {
      p_buyer_id: buyerId,
      p_purchase_id: purchaseId,
      p_target_habit_business_id: null,
      p_habit_description: habitDescription,
      p_recurrence_interval: recurrenceInterval,
      p_goal_value: goalValue,
      p_active_days: activeDays ?? null,
      p_business_name: businessName
    });
    if (error) {
      console.error('Error resolving marketplace purchase into a new habit:', error);
      throw error;
    }
    return data as string;
  }

  /** Every purchase this user made but hasn't yet chosen a target business for, oldest first. */
  async getUnresolvedPurchases(buyerId: string): Promise<MarketplacePurchase[]> {
    const { data, error } = await this.supabase
      .from('marketplace_purchases')
      .select('*')
      .eq('buyer_id', buyerId)
      .eq('resolved', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading unresolved marketplace purchases:', error);
      throw error;
    }

    return data ?? [];
  }

  private getLastSeenKey(viewerId: string): string {
    return `marketplace-last-seen-${viewerId}`;
  }

  /** Timestamp (ms) this user last viewed the Marketplace tab; listings created after this count as "new". */
  getLastSeenTime(viewerId: string): number {
    const stored = localStorage.getItem(this.getLastSeenKey(viewerId));
    return stored ? parseInt(stored, 10) : 0;
  }

  /** Call when the user opens the Marketplace tab, to clear the "new listings" badge. */
  markListingsSeen(viewerId: string): void {
    localStorage.setItem(this.getLastSeenKey(viewerId), Date.now().toString());
  }

  /** Unresolved purchases + friends' listings posted since this user last viewed the Marketplace tab. */
  async getMarketplaceBadgeCount(viewerId: string): Promise<number> {
    try {
      const [listings, unresolvedPurchases] = await Promise.all([
        this.getListings(viewerId),
        this.getUnresolvedPurchases(viewerId)
      ]);

      const lastSeen = this.getLastSeenTime(viewerId);
      const newListingsCount = listings.filter(l => !l.is_own && new Date(l.created_at).getTime() > lastSeen).length;

      return unresolvedPurchases.length + newListingsCount;
    } catch (error) {
      console.error('Error computing marketplace badge count:', error);
      return 0;
    }
  }
}
