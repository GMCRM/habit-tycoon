/**
 * Format a Date as YYYY-MM-DD in the LOCAL timezone (not UTC) — used
 * anywhere a date needs to match the user's own day boundary (habit
 * completions, streak resets, dashboard date grouping). Previously
 * duplicated near-identically across HabitBusinessService,
 * HabitUpdateService, and HabitRealtimeService.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
