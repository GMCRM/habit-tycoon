import Foundation
import Capacitor
import WidgetKit

/// Writes the data the HabitWidget extension reads: a non-sensitive habit
/// snapshot into the App Group's shared UserDefaults suite, and the
/// sensitive Supabase session into the shared Keychain Access Group.
/// Long-lived credentials belong in Keychain, not a plist — see the plan
/// doc's writeup on this split.
///
/// The widget-side counterparts of these constants/formats live in
/// ios/App/HabitWidget/WidgetConstants.swift, WidgetModels.swift, and
/// KeychainStore.swift — no shared package between the two targets (adding
/// a local SPM package via hand-edited project.pbxproj was judged too risky
/// for this project), so keep both sides in sync manually.
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin {
    private static let appGroupId = "group.com.grantcross.habittycoon"
    private static let habitSnapshotKey = "widget_habit_snapshot_v1"
    private static let widgetKind = "HabitWidget"
    private static let keychainService = "com.grantcross.habittycoon.widget-auth"
    private static let keychainAccessGroup = "2Z4X8652XC.com.grantcross.habittycoon.shared"

    /// `habits` is the raw array of habit_businesses rows (already filtered
    /// to is_active by the caller) — see HabitCacheService's syncWidget().
    @objc func syncHabits(_ call: CAPPluginCall) {
        guard let habits = call.getArray("habits", JSObject.self) else {
            call.reject("Missing habits array")
            return
        }

        let payload: [String: Any] = [
            "habits": habits,
            "updated_at": ISO8601DateFormatter().string(from: Date()),
        ]

        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let defaults = UserDefaults(suiteName: Self.appGroupId) else {
            call.reject("Failed to write habit snapshot")
            return
        }
        defaults.set(data, forKey: Self.habitSnapshotKey)

        WidgetCenter.shared.reloadTimelines(ofKind: Self.widgetKind)
        call.resolve()
    }

    /// `expiresAt` is epoch seconds (JS `session.expires_at`, already epoch
    /// seconds in a Supabase session object — no date-string parsing needed).
    @objc func syncAuthSession(_ call: CAPPluginCall) {
        guard let accessToken = call.getString("accessToken"),
              let refreshToken = call.getString("refreshToken"),
              let userId = call.getString("userId"),
              let expiresAt = call.getDouble("expiresAt") else {
            call.reject("Missing session fields")
            return
        }

        let session: [String: Any] = [
            "accessToken": accessToken,
            "refreshToken": refreshToken,
            "accessTokenExpiresAt": ISO8601DateFormatter().string(from: Date(timeIntervalSince1970: expiresAt)),
            "userId": userId,
        ]

        guard let data = try? JSONSerialization.data(withJSONObject: session) else {
            call.reject("Failed to encode session")
            return
        }

        let query = Self.keychainQuery()
        let updateStatus = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)
        if updateStatus == errSecItemNotFound {
            var newItem = query
            newItem[kSecValueData as String] = data
            newItem[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
            SecItemAdd(newItem as CFDictionary, nil)
        }

        call.resolve()
    }

    @objc func clearAuthSession(_ call: CAPPluginCall) {
        SecItemDelete(Self.keychainQuery() as CFDictionary)
        call.resolve()
    }

    private static func keychainQuery() -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "session",
            kSecAttrAccessGroup as String: keychainAccessGroup,
        ]
    }
}
