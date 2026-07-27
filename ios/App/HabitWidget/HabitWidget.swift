import WidgetKit
import SwiftUI
import AppIntents

struct HabitWidgetEntry: TimelineEntry {
    let date: Date
    let habits: [WidgetHabit]
    let errorHabitId: String?
}

struct HabitWidgetProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> HabitWidgetEntry {
        HabitWidgetEntry(date: Date(), habits: Self.placeholderHabits(for: context.family), errorHabitId: nil)
    }

    func snapshot(for configuration: HabitWidgetConfigurationIntent, in context: Context) async -> HabitWidgetEntry {
        buildEntry(for: configuration, family: context.family)
    }

    func timeline(for configuration: HabitWidgetConfigurationIntent, in context: Context) async -> Timeline<HabitWidgetEntry> {
        let entry = buildEntry(for: configuration, family: context.family)

        // Primary freshness mechanism is CompleteHabitIntent calling
        // WidgetCenter.reloadTimeline after every attempt; this is just a
        // staleness backstop — sooner of +60min or next local midnight
        // (period rollover). The exact rollover state isn't fabricated here
        // (the widget can't know if reset_outdated_habits() has run yet) —
        // this just nudges WidgetKit to ask again around then.
        let nextHour = Date().addingTimeInterval(60 * 60)
        let nextMidnight = Calendar.current.nextDate(after: Date(), matching: DateComponents(hour: 0, minute: 0, second: 0), matchingPolicy: .nextTime) ?? nextHour
        let reloadDate = min(nextHour, nextMidnight)

        return Timeline(entries: [entry], policy: .after(reloadDate))
    }

    private func buildEntry(for configuration: HabitWidgetConfigurationIntent, family: WidgetFamily) -> HabitWidgetEntry {
        let snapshot = AppGroupStore.loadSnapshot()
        let allHabits = snapshot?.habits ?? []
        let budget = Self.rowBudget(for: family)

        let selected: [WidgetHabit]
        switch configuration.selectionMode {
        case .auto:
            selected = Self.autoSelection(from: allHabits)
        case .chooseHabits:
            let chosenIds = configuration.chosenHabits.map(\.id)
            if chosenIds.isEmpty {
                selected = Self.autoSelection(from: allHabits)
            } else {
                let byId = Dictionary(uniqueKeysWithValues: allHabits.map { ($0.id, $0) })
                let resolved = chosenIds.compactMap { byId[$0] }
                selected = resolved.isEmpty ? Self.autoSelection(from: allHabits) : resolved.sorted { $0.displayOrder < $1.displayOrder }
            }
        }

        let errorHabitId = AppGroupStore.recentCompletionErrorHabitId()
        return HabitWidgetEntry(date: Date(), habits: Array(selected.prefix(budget)), errorHabitId: errorHabitId)
    }

    private static func autoSelection(from habits: [WidgetHabit]) -> [WidgetHabit] {
        habits
            .filter { $0.isActive && !HabitPeriodLogic.isHabitCompleteForCurrentPeriod($0) }
            .sorted { $0.displayOrder < $1.displayOrder }
    }

    static func rowBudget(for family: WidgetFamily) -> Int {
        switch family {
        case .systemSmall: return 1
        case .systemMedium: return 3
        case .systemLarge: return 6
        default: return 3
        }
    }

    static func placeholderHabits(for family: WidgetFamily) -> [WidgetHabit] {
        (0..<rowBudget(for: family)).map { index in
            WidgetHabit(
                id: "placeholder-\(index)",
                businessName: "Read 20 minutes",
                businessIcon: "🍩",
                currentProgress: 0,
                goalValue: 1,
                streak: 3,
                lastCompletedAt: nil,
                recurrenceInterval: "24h",
                activeDays: nil,
                displayOrder: index,
                isActive: true
            )
        }
    }
}

struct HabitWidgetEntryView: View {
    var entry: HabitWidgetEntry

    var body: some View {
        let compact = entry.habits.count > 1

        VStack(alignment: .leading, spacing: compact ? 8 : 12) {
            if entry.habits.isEmpty {
                Text("All done for today 🎉")
                    .font(.system(.subheadline, design: .rounded).weight(.bold))
                    .foregroundColor(Color("GoldText"))
            } else {
                ForEach(entry.habits) { habit in
                    HabitRowView(
                        habit: habit,
                        isComplete: HabitPeriodLogic.isHabitCompleteForCurrentPeriod(habit),
                        hasError: entry.errorHabitId == habit.id,
                        compact: compact
                    )
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(for: .widget) {
            Color("NavyCard")
        }
    }
}

struct HabitWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: WidgetConstants.widgetKind,
            intent: HabitWidgetConfigurationIntent.self,
            provider: HabitWidgetProvider()
        ) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Habit Tycoon")
        .description("Complete your habits without opening the app.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemMedium) {
    HabitWidget()
} timeline: {
    HabitWidgetEntry(date: .now, habits: HabitWidgetProvider.placeholderHabits(for: .systemMedium), errorHabitId: nil)
}
