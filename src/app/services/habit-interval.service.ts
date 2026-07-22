import { Injectable } from '@angular/core';
import { HabitBusiness } from './habit-business.service';

export type RecurrenceInterval = '24h' | 'specific_days';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable({
  providedIn: 'root'
})
export class HabitIntervalService {

  private localMidnight(now: Date = new Date()): Date {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  /**
   * Returns the start of the current interval period in local time.
   * Both '24h' and 'specific_days' use today's midnight.
   */
  getCurrentPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    return this.localMidnight(now);
  }

  /**
   * Returns the start of the next interval period (tomorrow's midnight).
   */
  getNextPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    const midnight = this.localMidnight(now);
    return new Date(midnight.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Returns the start of the previous interval period (yesterday's midnight).
   */
  getPreviousPeriodStart(interval: RecurrenceInterval, now: Date = new Date()): Date {
    const midnight = this.localMidnight(now);
    return new Date(midnight.getTime() - 24 * 60 * 60 * 1000);
  }

  /**
   * Returns true if today is an active day for this habit.
   * Always true for '24h' habits.
   */
  isTodayActiveDay(habit: HabitBusiness, now: Date = new Date()): boolean {
    const interval = this.resolveInterval(habit);
    if (interval !== 'specific_days') return true;
    const activeDays = habit.active_days || [];
    return activeDays.includes(now.getDay());
  }

  /**
   * Returns the start (midnight) of the most recent previous active day.
   * Walks back up to 7 days. Used for streak validation.
   */
  getPreviousActiveDayStart(activeDays: number[], now: Date = new Date()): Date {
    for (let daysBack = 1; daysBack <= 7; daysBack++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay())) return d;
    }
    // Fallback: yesterday (shouldn't reach here for a non-empty activeDays)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  }

  /**
   * Returns the midnight of the next upcoming active day (not counting today).
   */
  private getNextActiveDayStart(activeDays: number[], now: Date = new Date()): Date {
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay())) return d;
    }
    // Fallback: tomorrow
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }

  /**
   * Returns the full day name of the next upcoming active day (e.g. "Monday").
   */
  getNextActiveDayLabel(activeDays: number[], now: Date = new Date()): string {
    for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, 0, 0, 0, 0);
      if (activeDays.includes(d.getDay())) return DAY_NAMES[d.getDay()];
    }
    return '';
  }

  /**
   * Seconds remaining until the current period ends.
   * For 'specific_days' on a non-active day: seconds until the next active day's midnight.
   */
  getSecondsUntilReset(interval: RecurrenceInterval, now: Date = new Date(), activeDays?: number[]): number {
    if (interval === 'specific_days' && activeDays && !activeDays.includes(now.getDay())) {
      const next = this.getNextActiveDayStart(activeDays, now);
      return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
    }
    const next = this.getNextPeriodStart(interval, now);
    return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  }

  /**
   * Formats a countdown in seconds to HH:MM or Xd:HH:MM.
   */
  formatCountdown(seconds: number, interval: RecurrenceInterval): string {
    if (seconds <= 0) return '00:00';

    const totalMinutes = Math.floor(seconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const hrs = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    const mm = String(mins).padStart(2, '0');
    const hh = String(hrs).padStart(2, '0');

    if (days > 0) return `${days}d:${hh}:${mm}`;
    return `${String(totalHours).padStart(2, '0')}:${mm}`;
  }

  /**
   * Resolves a habit's recurrence interval.
   * Maps legacy '7d' and frequency='weekly' → 'specific_days'.
   */
  resolveInterval(habit: HabitBusiness): RecurrenceInterval {
    const ri = habit.recurrence_interval as string;
    if (ri === 'specific_days' || ri === '7d') return 'specific_days';
    if (habit.frequency === 'weekly') return 'specific_days';
    return '24h';
  }

  /**
   * Returns true if the habit has met its goal within the current active period.
   * For 'specific_days' on a rest day, there's nothing to do today, so the habit
   * counts as "done" regardless of whether it was completed on its last active day.
   */
  isHabitCompleteForCurrentPeriod(habit: HabitBusiness, now: Date = new Date()): boolean {
    const interval = this.resolveInterval(habit);

    if (interval === 'specific_days' && !this.isTodayActiveDay(habit, now)) return true;

    const goalValue = habit.goal_value || 1;
    const currentProgress = habit.current_progress || 0;

    if (currentProgress < goalValue) return false;
    if (!habit.last_completed_at) return false;

    const periodStart = this.getCurrentPeriodStart(interval, now);
    const lastCompleted = new Date(habit.last_completed_at);

    return lastCompleted >= periodStart;
  }

  /**
   * Returns true if the habit's last completion falls within the previous active period.
   * For 'specific_days': "previous period" = the most recent previous active day.
   */
  wasCompletedInPreviousPeriod(habit: HabitBusiness, now: Date = new Date()): boolean {
    if (!habit.last_completed_at) return false;

    const interval = this.resolveInterval(habit);
    const lastCompleted = new Date(habit.last_completed_at);

    if (interval === 'specific_days') {
      const activeDays = habit.active_days || [];
      if (activeDays.length === 0) return false;
      const prevActiveStart = this.getPreviousActiveDayStart(activeDays, now);
      const prevActiveEnd = new Date(prevActiveStart.getTime() + 24 * 60 * 60 * 1000);
      return lastCompleted >= prevActiveStart && lastCompleted < prevActiveEnd;
    }

    const prevStart = this.getPreviousPeriodStart(interval, now);
    const currStart = this.getCurrentPeriodStart(interval, now);
    return lastCompleted >= prevStart && lastCompleted < currStart;
  }

  /**
   * Returns true if this is a daily ('24h') habit that was NOT completed yesterday.
   * Only applies to simple daily habits (goal_value === 1).
   */
  didMissYesterday(habit: HabitBusiness, now: Date = new Date()): boolean {
    const interval = this.resolveInterval(habit);
    if (interval !== '24h') {
      console.log('[didMissYesterday] SKIP: interval is', interval);
      return false;
    }
    if ((habit.goal_value || 1) !== 1) {
      console.log('[didMissYesterday] SKIP: goal_value is', habit.goal_value);
      return false;
    }

    const yesterdayStart = this.getPreviousPeriodStart('24h', now);
    const todayStart = this.getCurrentPeriodStart('24h', now);

    const habitCreatedAt = new Date(habit.created_at);
    if (habitCreatedAt >= todayStart) {
      console.log('[didMissYesterday] SKIP: habit created today', habitCreatedAt);
      return false;
    }

    if (!habit.last_completed_at) {
      console.log('[didMissYesterday] TRUE: never completed');
      return true;
    }

    const lastCompleted = new Date(habit.last_completed_at);
    const result = lastCompleted < yesterdayStart;
    console.log('[didMissYesterday] lastCompleted:', lastCompleted, '| yesterdayStart:', yesterdayStart, '| result:', result);
    return result;
  }

  /**
   * Returns a UI label for the interval.
   */
  getIntervalLabel(interval: RecurrenceInterval): string {
    return interval === 'specific_days' ? 'Specific Days' : '1 Day';
  }
}
