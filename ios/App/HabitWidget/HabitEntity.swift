import AppIntents

/// The pickable unit in "Choose Habits" mode's widget-edit sheet. Backed
/// entirely by the App Group snapshot — never a network call, since
/// EntityQuery runs live while the user is sitting in the widget gallery.
struct HabitEntity: AppEntity {
    let id: String
    let businessName: String

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Habit"
    static var defaultQuery = HabitEntityQuery()

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(businessName)")
    }
}

struct HabitEntityQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [HabitEntity] {
        let habits = AppGroupStore.loadSnapshot()?.habits ?? []
        return habits
            .filter { identifiers.contains($0.id) }
            .map { HabitEntity(id: $0.id, businessName: $0.businessName) }
    }

    func suggestedEntities() async throws -> [HabitEntity] {
        let habits = AppGroupStore.loadSnapshot()?.habits ?? []
        return habits
            .sorted { $0.displayOrder < $1.displayOrder }
            .map { HabitEntity(id: $0.id, businessName: $0.businessName) }
    }
}
