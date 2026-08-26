import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { HabitUpdateService } from './habit-update.service';
import { getLocalDateString } from '../shared/date.util';

/**
 * Pushes cross-device habit-completion changes, and dividend/cash changes
 * from OTHER users' actions, into the existing HabitUpdateService bus.
 * Without this, a completion made on one device — or a dividend someone
 * else's habit completion just paid into this account — is only known once
 * this client happens to refetch (navigation, app restart, or the 20s poll
 * fallback below).
 *
 * Subscribes to Postgres changes on `habit_completions` (INSERT/DELETE) and
 * `user_profiles` (UPDATE) for the signed-in user (RLS-scoped) and
 * translates them into the same completion/undo/resync events a local
 * habit-card completion already emits, so habit-grid's live patch and the
 * home dashboard's cash display both refresh as soon as the change lands —
 * a dividend payout no longer waits on the poll or a manual navigation.
 */
@Injectable({
  providedIn: 'root',
})
export class HabitRealtimeService {
  private supabaseService = inject(SupabaseService);
  private habitUpdateService = inject(HabitUpdateService);

  private channel: RealtimeChannel | null = null;
  private activeUserId: string | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;

  // Some mobile browsers (observed on iPad Chrome, which is WebKit under the
  // hood) don't reliably deliver postgres_changes events over the Realtime
  // WebSocket even while the tab is visible and the channel reports as
  // subscribed — the same code works fine on desktop Chrome. Rather than
  // depend entirely on that socket, poll for a resync on this interval as a
  // safety net so a completion made on another device is never stuck
  // waiting more than this long, independent of whether the WebSocket path
  // is actually working on a given device.
  private static readonly POLL_INTERVAL_MS = 20000;

  start(userId: string): void {
    if (this.activeUserId === userId && this.channel) return;
    this.stop();

    this.activeUserId = userId;
    this.channel = this.supabaseService.client
      .channel(`habit-completions-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'habit_completions', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as { habit_business_id?: string; completed_at?: string };
          if (!row.habit_business_id) return;
          this.habitUpdateService.emitHabitCompletion(row.habit_business_id, this.toLocalDateString(row.completed_at));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'habit_completions', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.old as { habit_business_id?: string; completed_at?: string };
          if (!row.habit_business_id) return;
          this.habitUpdateService.emitHabitUndo(row.habit_business_id, this.toLocalDateString(row.completed_at));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${userId}` },
        () => {
          // Someone else's habit completion (a dividend payout, most
          // commonly) just changed this user's cash/net_worth — a plain
          // resync is enough, home.page.ts's subscriber re-reads the
          // profile from here.
          this.habitUpdateService.emitResync();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`⚠️ HabitRealtimeService: channel ${status.toLowerCase()}, relying on the poll fallback`);
        }
      });

    // Gate the poll on tab visibility to avoid polling a genuinely
    // backgrounded browser tab — but only on web. Capacitor's WKWebView
    // (the native iOS app shell) doesn't reliably report
    // document.visibilityState as 'visible' even while the app is
    // foregrounded and on-screen, which would silently keep this fallback
    // from ever firing on-device — the app's own lifecycle (start()/stop()
    // called on sign-in/out and app destroy) is what actually bounds it
    // natively, so no extra gating is needed there.
    const isNative = Capacitor.isNativePlatform();
    this.pollIntervalId = setInterval(() => {
      if (isNative || document.visibilityState === 'visible') {
        this.habitUpdateService.emitResync();
      }
    }, HabitRealtimeService.POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.channel) {
      this.supabaseService.client.removeChannel(this.channel);
      this.channel = null;
    }
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.activeUserId = null;
  }

  /** DELETE payloads only reliably carry the old row's primary/replica-identity columns; fall back to today if completed_at is missing. */
  private toLocalDateString(completedAt?: string): string {
    return getLocalDateString(completedAt ? new Date(completedAt) : new Date());
  }
}
