import Foundation

/// Read-only port of HabitIntervalService, used only to decide which habits
/// "Auto" mode shows (not yet complete for the current period) — display
/// filtering, not money math, which lives solely in the complete_habit_business
/// RPC now. Mirrors resolveInterval/isHabitCompleteForCurrentPeriod exactly.
enum HabitPeriodLogic {
    enum Interval {
        case daily
        case specificDays
    }

    static func resolveInterval(_ habit: WidgetHabit) -> Interval {
        if habit.recurrenceInterval == "specific_days" || habit.recurrenceInterval == "7d" {
            return .specificDays
        }
        return .daily
    }

    static func isTodayActiveDay(_ habit: WidgetHabit, now: Date = Date()) -> Bool {
        guard resolveInterval(habit) == .specificDays else { return true }
        let activeDays = habit.activeDays ?? []
        let weekday = Calendar.current.component(.weekday, from: now) - 1 // 0=Sun..6=Sat, matches JS getDay()
        return activeDays.contains(weekday)
    }

    static func isHabitCompleteForCurrentPeriod(_ habit: WidgetHabit, now: Date = Date()) -> Bool {
        if resolveInterval(habit) == .specificDays && !isTodayActiveDay(habit, now: now) {
            return true
        }

        let goalValue = max(habit.goalValue, 1)
        if habit.currentProgress < goalValue { return false }
        guard let lastCompletedAt = habit.lastCompletedAt else { return false }

        let periodStart = Calendar.current.startOfDay(for: now)
        return lastCompletedAt >= periodStart
    }
}
