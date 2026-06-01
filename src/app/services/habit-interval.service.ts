import { Injectable } from '@angular/core';
import { HabitBusiness } from './habit-business.service';

export type RecurrenceInterval = '24h' | '7d';

@Injectable({
  providedIn: 'root'
})
export class HabitIntervalService {

  /**
   * Returns the start of the current interval period in local time.
   *
   * '24h' → local midnight of today
   * '7d'  → local midnight of the most recent Sunday
   */
  getCurrentPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    if (interval === '24h') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    // '7d': roll back to the most recent Sunday
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
    return sunday;
  }

  /**
   * Returns the start of the next interval period in local time.
   */
  getNextPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    const current = this.getCurrentPeriodStart(interval, now);
    if (interval === '24h') {
      return new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
    return new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Returns the start of the PREVIOUS interval period in local time.
   * Used for streak validation.
   */
  getPreviousPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    const current = this.getCurrentPeriodStart(interval, now);
    if (interval === '24h') {
      return new Date(current.getTime() - 24 * 60 * 60 * 1000);
    }
    return new Date(current.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Seconds remaining until the current period ends.
   */
  getSecondsUntilReset(interval: RecurrenceInterval, now: Date = new Date()): number {
    const next = this.getNextPeriodStart(interval, now);
    return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  }

  /**
   * Formats a countdown in seconds into a human-readable string.
   *
   * '24h' → "HH:MM"   (e.g. "04:12")
   * '7d'  → "Xd:HH:MM" (e.g. "2d:14:22")
   */
  formatCountdown(seconds: number, interval: RecurrenceInterval): string {
    if (seconds <= 0) return interval === '7d' ? '0d:00:00' : '00:00';

    const totalMinutes = Math.floor(seconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const hrs = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const mm = String(mins).padStart(2, '0');
    const hh = String(hrs).padStart(2, '0');

    if (interval === '7d') {
      return `${days}d:${hh}:${mm}`;
    }
    return `${String(totalHours).padStart(2, '0')}:${mm}`;
  }

  /**
   * Resolves a habit's recurrence interval, falling back to the deprecated
   * `frequency` field so habits created before the migration still work.
   */
  resolveInterval(habit: HabitBusiness): RecurrenceInterval {
    if (habit.recurrence_interval) return habit.recurrence_interval;
    return habit.frequency === 'weekly' ? '7d' : '24h';
  }

  /**
   * Returns true if the habit has met its goal within the current period.
   * Relies on current_progress being up-to-date (reset by server-side RPC on app open).
   */
  isHabitCompleteForCurrentPeriod(habit: HabitBusiness): boolean {
    const interval = this.resolveInterval(habit);
    const goalValue = habit.goal_value || 1;
    const currentProgress = habit.current_progress || 0;

    if (currentProgress < goalValue) return false;
    if (!habit.last_completed_at) return false;

    const periodStart = this.getCurrentPeriodStart(interval);
    const lastCompleted = new Date(habit.last_completed_at);

    return lastCompleted >= periodStart;
  }

  /**
   * Returns true if the habit's last completion falls within the previous period.
   * Used to determine whether a streak should be incremented vs reset.
   */
  wasCompletedInPreviousPeriod(habit: HabitBusiness, now: Date = new Date()): boolean {
    if (!habit.last_completed_at) return false;

    const interval = this.resolveInterval(habit);
    const prevStart = this.getPreviousPeriodStart(interval, now);
    const currStart = this.getCurrentPeriodStart(interval, now);
    const lastCompleted = new Date(habit.last_completed_at);

    return lastCompleted >= prevStart && lastCompleted < currStart;
  }

  /**
   * Returns true if this is a daily habit that was NOT completed yesterday
   * and has prior completion history. Used to decide whether to show the
   * "missed yesterday" prompt before a new completion.
   *
   * Only applies to simple daily habits (goal_value === 1).
   */
  didMissYesterday(habit: HabitBusiness, now: Date = new Date()): boolean {
    if (this.resolveInterval(habit) !== '24h') return false;
    if ((habit.goal_value || 1) !== 1) return false;

    const yesterdayStart = this.getPreviousPeriodStart('24h', now);
    const todayStart = this.getCurrentPeriodStart('24h', now);

    // Habit must have existed before today (can't miss yesterday on a brand-new habit)
    const habitCreatedAt = new Date(habit.created_at);
    if (habitCreatedAt >= todayStart) return false;

    // If never completed, the habit existed yesterday and was missed
    if (!habit.last_completed_at) return true;

    const lastCompleted = new Date(habit.last_completed_at);

    // If last completion is before yesterday's start, the user missed yesterday
    return lastCompleted < yesterdayStart;
  }

  /**
   * Returns a label for the interval suitable for UI display.
   */
  getIntervalLabel(interval: RecurrenceInterval): string {
    return interval === '24h' ? '1 Day' : '1 Week';
  }
}
