import AppIntents
import WidgetKit

enum HabitSelectionMode: String, AppEnum {
    case auto
    case chooseHabits

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Habit Selection"
    static var caseDisplayRepresentations: [HabitSelectionMode: DisplayRepresentation] = [
        .auto: "Today's Habits (Auto)",
        .chooseHabits: "Choose Habits",
    ]
}

struct HabitWidgetConfigurationIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Habit Widget"
    static var description = IntentDescription("Shows your habits and lets you complete them without opening the app.")

    @Parameter(title: "Habit Selection", default: .auto)
    var selectionMode: HabitSelectionMode

    @Parameter(title: "Habits", default: [])
    var chosenHabits: [HabitEntity]

    static var parameterSummary: some ParameterSummary {
        Switch(\.$selectionMode) {
            Case(.auto) {
                Summary("\(\.$selectionMode)")
            }
            DefaultCase {
                Summary("\(\.$selectionMode)") {
                    \.$chosenHabits
                }
            }
        }
    }
}
