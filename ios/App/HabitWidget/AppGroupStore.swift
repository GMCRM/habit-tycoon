import Foundation
import WidgetKit

/// Read/write access to the App Group's shared UserDefaults suite. All reads
/// here are synchronous and local — never triggers a network call, since
/// this is used from EntityQuery and the timeline provider, both of which
/// run while the user may be sitting in the widget gallery/edit UI.
enum AppGroupStore {
    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: WidgetConstants.appGroupId)
    }

    static func loadSnapshot() -> WidgetHabitSnapshot? {
        guard let data = defaults?.data(forKey: WidgetConstants.habitSnapshotKey) else { return nil }
        return try? WidgetJSONCoding.decoder.decode(WidgetHabitSnapshot.self, from: data)
    }

    static func recordCompletionError(habitId: String) {
        let marker = WidgetCompletionError(habitId: habitId, occurredAt: Date())
        guard let data = try? WidgetJSONCoding.encoder.encode(marker) else { return }
        defaults?.set(data, forKey: WidgetConstants.lastCompletionErrorKey)
    }

    /// Returns the habit id that most recently failed to complete, if the
    /// failure happened within the last ~10 seconds (self-expiring — no
    /// separate "clear" write needed).
    static func recentCompletionErrorHabitId() -> String? {
        guard let data = defaults?.data(forKey: WidgetConstants.lastCompletionErrorKey),
              let marker = try? WidgetJSONCoding.decoder.decode(WidgetCompletionError.self, from: data),
              !marker.isStale else { return nil }
        return marker.habitId
    }

    static func reloadTimeline() {
        WidgetCenter.shared.reloadTimelines(ofKind: WidgetConstants.widgetKind)
    }
}
