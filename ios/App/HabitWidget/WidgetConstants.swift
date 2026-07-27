import Foundation

/// Shared identifiers the widget extension and the main app must agree on.
/// The App-side half of this contract lives in
/// ios/App/App/Plugins/WidgetBridgePlugin.swift — keep both in sync.
enum WidgetConstants {
    static let appGroupId = "group.com.grantcross.habittycoon"
    static let keychainService = "com.grantcross.habittycoon.widget-auth"

    /// Keychain Sharing's $(AppIdentifierPrefix) resolves to the team ID at
    /// codesign time (see the .entitlements files); SecItem calls at runtime
    /// need the already-resolved string, so the team ID is inlined here.
    /// DEVELOPMENT_TEAM in project.pbxproj is the source of truth — update
    /// both together if the signing team ever changes.
    static let keychainAccessGroup = "2Z4X8652XC.com.grantcross.habittycoon.shared"

    static let supabaseUrl = URL(string: "https://xqdzixbmnegeunjnzrla.supabase.co")!
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM"

    static let widgetKind = "HabitWidget"

    /// Key under the App Group's shared UserDefaults suite where the main
    /// app writes its habit snapshot (see WidgetBridgePlugin.syncHabits).
    static let habitSnapshotKey = "widget_habit_snapshot_v1"
    /// Key for a small transient "last completion failed" marker, written by
    /// CompleteHabitIntent on failure and read by the timeline provider to
    /// render an inline error state (widgets can't show toasts).
    static let lastCompletionErrorKey = "widget_last_completion_error_v1"
}
