import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { HabitBusiness, BusinessType } from './habit-business.service';
import { WidgetBridge } from './widget-bridge.plugin';

const CACHE_KEY = 'habit_cache_snapshot_v1';

export interface CachedProfile {
  cash: number;
  net_worth: number;
  name?: string;
}

/** Enough of a habit's pre-completion state to exactly reverse an optimistic apply, in case it's undone before it ever syncs. */
export interface PendingCompletionDelta {
  earnings: number;
  previousStreak: number;
  previousProgress: number;
  previousTotalCompletions: number;
  previousTotalEarnings: number;
  previousLastCompletedAt: string | null;
}

interface HabitCacheSnapshot {
  habits: HabitBusiness[];
  businessTypes: BusinessType[];
  profile: CachedProfile | null;
  updatedAt: string;
  /** Per-habit LIFO stack of not-yet-synced completions, so an offline undo can reverse the most recent one exactly. */
  pendingDeltas: Record<string, PendingCompletionDelta[]>;
}

const EMPTY_SNAPSHOT: HabitCacheSnapshot = {
  habits: [],
  businessTypes: [],
  profile: null,
  updatedAt: new Date(0).toISOString(),
  pendingDeltas: {},
};

/**
 * Local read-through cache for the data the home screen needs to be usable
 * with zero connectivity (habits, the business-type catalog, and the cash/
 * net-worth profile snapshot). Backed by Capacitor Preferences, matching the
 * storage mechanism already used for the auth session and the offline
 * mutation queue rather than introducing a new persistence dependency
 * (SQLite etc.) for what's a small, single-user JSON blob.
 *
 * This is a *cache*, not a source of truth: every successful network read
 * refreshes it, and it's only ever consulted when a network read fails.
 * Optimistic writes made while offline (see HabitBusinessService) go through
 * the same upsert/patch/remove methods so the cache and the pending offline
 * queue stay consistent with each other.
 */
@Injectable({
  providedIn: 'root',
})
export class HabitCacheService {
  private snapshot: HabitCacheSnapshot | null = null;

  private async load(): Promise<HabitCacheSnapshot> {
    if (this.snapshot) return this.snapshot;
    const { value } = await Preferences.get({ key: CACHE_KEY });
    if (!value) {
      this.snapshot = { ...EMPTY_SNAPSHOT };
      return this.snapshot;
    }
    try {
      const parsed = JSON.parse(value) as Partial<HabitCacheSnapshot>;
      this.snapshot = { ...EMPTY_SNAPSHOT, ...parsed, pendingDeltas: parsed.pendingDeltas || {} };
    } catch {
      this.snapshot = { ...EMPTY_SNAPSHOT };
    }
    return this.snapshot;
  }

  private async save(snapshot: HabitCacheSnapshot): Promise<void> {
    this.snapshot = snapshot;
    await Preferences.set({ key: CACHE_KEY, value: JSON.stringify(snapshot) });
    // Fire-and-forget: every cache mutation (habit list load, completion,
    // undo, offline patch...) is a single choke point through save(), so
    // this is the one place the iOS widget's snapshot needs to be kept
    // current from. Never awaited — widget sync must never block or fail
    // a cache write (WidgetBridge itself swallows all errors too).
    this.syncWidget(snapshot.habits);
  }

  private syncWidget(habits: HabitBusiness[]): void {
    const activeHabits = habits
      .filter(h => h.is_active)
      .map(h => ({
        id: h.id,
        business_name: h.business_name,
        business_icon: h.business_icon,
        current_progress: h.current_progress,
        goal_value: h.goal_value,
        streak: h.streak,
        last_completed_at: h.last_completed_at ?? null,
        recurrence_interval: h.recurrence_interval,
        active_days: h.active_days ?? null,
        display_order: h.display_order,
        is_active: h.is_active,
      }));
    void WidgetBridge.syncHabits({ habits: activeHabits });
  }

  async getHabits(): Promise<HabitBusiness[]> {
    return (await this.load()).habits;
  }

  async setHabits(habits: HabitBusiness[]): Promise<void> {
    const snapshot = await this.load();
    await this.save({ ...snapshot, habits, updatedAt: new Date().toISOString() });
  }

  async getBusinessTypes(): Promise<BusinessType[]> {
    return (await this.load()).businessTypes;
  }

  async setBusinessTypes(businessTypes: BusinessType[]): Promise<void> {
    const snapshot = await this.load();
    await this.save({ ...snapshot, businessTypes });
  }

  async getProfile(): Promise<CachedProfile | null> {
    return (await this.load()).profile;
  }

  async setProfile(profile: CachedProfile): Promise<void> {
    const snapshot = await this.load();
    await this.save({ ...snapshot, profile });
  }

  /** Adjust the cached cash/net-worth balance by a provisional delta (e.g. a completion's earnings). */
  async adjustProfileCash(delta: number): Promise<void> {
    const snapshot = await this.load();
    if (!snapshot.profile) return;
    await this.save({
      ...snapshot,
      profile: {
        ...snapshot.profile,
        cash: snapshot.profile.cash + delta,
        net_worth: snapshot.profile.net_worth + delta,
      },
    });
  }

  /** Insert a new cached habit (e.g. an offline-created one) or replace an existing one by id. */
  async upsertHabit(habit: HabitBusiness): Promise<void> {
    const snapshot = await this.load();
    const habits = snapshot.habits.filter(h => h.id !== habit.id);
    habits.push(habit);
    await this.save({ ...snapshot, habits, updatedAt: new Date().toISOString() });
  }

  /** Apply a partial patch to a cached habit by id. No-op if the habit isn't cached. */
  async patchHabit(habitId: string, patch: Partial<HabitBusiness>): Promise<void> {
    const snapshot = await this.load();
    const habits = snapshot.habits.map(h => (h.id === habitId ? { ...h, ...patch } : h));
    await this.save({ ...snapshot, habits, updatedAt: new Date().toISOString() });
  }

  /** Replace a habit's id (e.g. a temp id being remapped to its real server id post-sync). */
  async renameHabitId(fromId: string, toId: string): Promise<void> {
    const snapshot = await this.load();
    const habits = snapshot.habits.map(h => (h.id === fromId ? { ...h, id: toId } : h));
    await this.save({ ...snapshot, habits, updatedAt: new Date().toISOString() });
  }

  /** Remove a cached habit entirely — used when a never-synced (temp id) habit is deleted offline. */
  async removeHabit(habitId: string): Promise<void> {
    const snapshot = await this.load();
    const habits = snapshot.habits.filter(h => h.id !== habitId);
    await this.save({ ...snapshot, habits, updatedAt: new Date().toISOString() });
  }

  async getUpdatedAt(): Promise<string> {
    return (await this.load()).updatedAt;
  }

  /** Records what a habit looked like just before an optimistic completion was applied to it, so it can be reversed exactly. */
  async pushPendingDelta(habitId: string, delta: PendingCompletionDelta): Promise<void> {
    const snapshot = await this.load();
    const stack = snapshot.pendingDeltas[habitId] || [];
    await this.save({
      ...snapshot,
      pendingDeltas: { ...snapshot.pendingDeltas, [habitId]: [...stack, delta] },
    });
  }

  /** Pops and returns the most recent not-yet-synced completion delta for a habit, or null if there isn't one. */
  async popPendingDelta(habitId: string): Promise<PendingCompletionDelta | null> {
    const snapshot = await this.load();
    const stack = snapshot.pendingDeltas[habitId];
    if (!stack || stack.length === 0) return null;
    const delta = stack[stack.length - 1];
    const remaining = { ...snapshot.pendingDeltas, [habitId]: stack.slice(0, -1) };
    await this.save({ ...snapshot, pendingDeltas: remaining });
    return delta;
  }

  /**
   * Wipe the cache (in-memory and persisted). The snapshot is keyed globally
   * rather than per-user, so this must run on sign-out — otherwise a second
   * account logging in on the same device while offline (before its first
   * successful network fetch) would fall back to the previous account's
   * cached cash/net-worth/habits.
   */
  async clear(): Promise<void> {
    this.snapshot = { ...EMPTY_SNAPSHOT };
    await Preferences.remove({ key: CACHE_KEY });
  }
}
