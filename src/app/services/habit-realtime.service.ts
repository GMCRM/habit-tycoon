import { Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { HabitUpdateService } from './habit-update.service';

/**
 * Pushes cross-device habit-completion changes into the existing
 * HabitUpdateService bus. Without this, a completion made on one device is
 * only known to that device's in-memory state — a second device/session
 * stays stale until it happens to refetch (navigation, app restart).
 *
 * Subscribes to Postgres changes on `habit_completions` for the signed-in
 * user (RLS-scoped) and translates INSERT/DELETE rows into the same
 * completion/undo events a local habit-card completion already emits, so
 * habit-grid's live patch and the home dashboard refresh both fire exactly
 * as if the change happened locally.
 */
@Injectable({
  providedIn: 'root',
})
export class HabitRealtimeService {
  private supabaseService = inject(SupabaseService);
  private habitUpdateService = inject(HabitUpdateService);

  private channel: RealtimeChannel | null = null;
  private activeUserId: string | null = null;

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
      .subscribe();
  }

  stop(): void {
    if (this.channel) {
      this.supabaseService.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.activeUserId = null;
  }

  /** DELETE payloads only reliably carry the old row's primary/replica-identity columns; fall back to today if completed_at is missing. */
  private toLocalDateString(completedAt?: string): string {
    const date = completedAt ? new Date(completedAt) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
