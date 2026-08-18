import { Injectable } from '@angular/core';
import { HabitBusiness } from './habit-business.service';

export type RecurrenceInterval = '24h' | 'specific_days';

/** Minimal fields getEffectiveStreak needs. HabitBusiness satisfies this
 *  structurally; callers with only a flattened/joined shape (e.g. stock
 *  view models) can pass a small literal instead of a full HabitBusiness. */
export type StreakSnapshot = Pick<HabitBusiness,
  'streak' | 'last_completed_at' | 'recurrence_interval' | 'frequency' | 'active_days' | 'goal_value' | 'current_progress'>;

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
   * Returns `habit.current_progress` scoped to the current period: 0 if the
   * last completion predates the current period's start, since the server
   * only zeroes `current_progress` itself via reset_outdated_habits() (run
   * when Home is opened), so the raw field can sit stale across a period
   * rollover until then. Callers displaying "today's" progress should use
   * this instead of reading `current_progress` directly.
   */
  getCurrentProgress(habit: HabitBusiness, now: Date = new Date()): number {
    const currentProgress = habit.current_progress || 0;
    if (currentProgress === 0 || !habit.last_completed_at) return 0;

    const interval = this.resolveInterval(habit);
    const periodStart = this.getCurrentPeriodStart(interval, now);
    const lastCompleted = new Date(habit.last_completed_at);

    return lastCompleted >= periodStart ? currentProgress : 0;
  }

  /**
   * Returns true if the habit has met its goal within the current active period.
   * For 'specific_days' on a rest day, there's nothing to do today, so the habit
   * counts as "done" regardless of whether it was completed on its last active day.
   */
  isHabitCompleteForCurrentPeriod(habit: HabitBusiness, now: Date = new Date()): boolean {
    const interval = this.resolveInterval(habit);

    if (interval === 'specific_days' && !this.isTodayActiveDay(habit, now)) {
      // One-day grace window: if yesterday was an active day that was missed,
      // don't count the habit as "done" yet — let it stay in the todo list
      // (with a Complete button) so the user can still backdate it. Once a
      // second day has passed, didMissYesterday goes false and this reverts
      // to "nothing due today" (rest day).
      if (this.didMissYesterday(habit, now)) return false;
      return true;
    }

    const goalValue = habit.goal_value || 1;
    return this.getCurrentProgress(habit, now) >= goalValue;
  }

  /**
   * Returns the [start, end) window of the previous active period.
   * For 'specific_days': the most recent previous active day. Returns null
   * if there's no previous period to check (e.g. a 'specific_days' habit
   * with no active days configured).
   */
  getPreviousPeriodWindow(habit: HabitBusiness, now: Date = new Date()): { start: Date; end: Date } | null {
    const interval = this.resolveInterval(habit);

    if (interval === 'specific_days') {
      const activeDays = habit.active_days || [];
      if (activeDays.length === 0) return null;
      const start = this.getPreviousActiveDayStart(activeDays, now);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { start, end };
    }

    return { start: this.getPreviousPeriodStart(interval, now), end: this.getCurrentPeriodStart(interval, now) };
  }

  /**
   * Returns the true current streak, correcting for the fact that `habit.streak`
   * is only ever zeroed out by completeHabit() (on next completion) or the
   * reset_outdated_habits() RPC (only run when Home is opened) — so it can sit
   * stale (non-zero) after a streak has actually broken. Pure and read-only:
   * no DB calls, derives everything from fields already on the object plus `now`.
   */
  getEffectiveStreak(habit: StreakSnapshot, now: Date = new Date()): number {
    const storedStreak = habit.streak || 0;
    if (storedStreak === 0 || !habit.last_completed_at) return storedStreak;

    const interval = this.resolveInterval(habit as HabitBusiness);
    const lastCompleted = new Date(habit.last_completed_at);
    const currentPeriodStart = this.getCurrentPeriodStart(interval, now);

    // Already touched in the current period — nothing to correct.
    if (lastCompleted >= currentPeriodStart) return storedStreak;

    // Rest day for a specific_days habit: there's no "current period" to have
    // missed yet, so don't second-guess the stored value.
    if (interval === 'specific_days' && !this.isTodayActiveDay(habit as HabitBusiness, now)) {
      return storedStreak;
    }

    const previousWindow = this.getPreviousPeriodWindow(habit as HabitBusiness, now);
    if (!previousWindow) return storedStreak; // can't evaluate — leave as-is

    // Last activity predates even the immediately-preceding period: at least
    // one full period elapsed with zero activity. Streak is broken.
    if (lastCompleted < previousWindow.start) return 0;

    // Last activity falls inside the previous period's window, so an actual
    // completion happened then. If reset_outdated_habits() hasn't run yet for
    // that rollover, current_progress still holds that period's final tally —
    // use it to tell whether the goal was actually met, mirroring
    // reset_outdated_habits() server-side.
    //
    // But current_progress === 0 here is a special case, not "0 attempts
    // that period": a real completion set last_completed_at inside this
    // window, which always bumps current_progress to at least 1 at the time,
    // so progress can only have come back down to exactly 0 since via
    // reset_outdated_habits() itself. That RPC only ever zeroes progress
    // without touching streak when the period's goal WAS met (a missed goal
    // zeroes streak too, which would have already returned above via the
    // storedStreak === 0 check) — so reaching this point with progress === 0
    // means the reset already ran and correctly preserved storedStreak.
    // Treating it as "0 < goalValue → broken" would re-break a streak the
    // server just finished confirming intact.
    const goalValue = habit.goal_value || 1;
    const currentProgress = habit.current_progress || 0;
    if (currentProgress === 0) return storedStreak;
    return currentProgress >= goalValue ? storedStreak : 0;
  }

  /**
   * Returns true if the habit had a due day yesterday — every day for '24h'
   * habits, or yesterday's weekday for 'specific_days' habits — that was NOT
   * completed. This is a one-day grace window: it only ever looks at
   * yesterday, so a day that was due two or more days ago (and never
   * backdated) reports false and can no longer be completed.
   * Only applies to simple habits (goal_value === 1).
   */
  didMissYesterday(habit: HabitBusiness, now: Date = new Date()): boolean {
    const interval = this.resolveInterval(habit);
    if ((habit.goal_value || 1) !== 1) {
      return false;
    }

    const yesterdayStart = this.getPreviousPeriodStart('24h', now);
    const todayStart = this.getCurrentPeriodStart('24h', now);

    if (interval === 'specific_days') {
      const activeDays = habit.active_days || [];
      if (!activeDays.includes(yesterdayStart.getDay())) {
        return false;
      }
    }

    const habitCreatedAt = new Date(habit.created_at);
    if (habitCreatedAt >= todayStart) {
      return false;
    }

    if (!habit.last_completed_at) {
      return true;
    }

    const lastCompleted = new Date(habit.last_completed_at);
    const result = lastCompleted < yesterdayStart;
    return result;
  }

  /**
   * Returns a UI label for the interval.
   */
  getIntervalLabel(interval: RecurrenceInterval): string {
    return interval === 'specific_days' ? 'Specific Days' : '1 Day';
  }
}
