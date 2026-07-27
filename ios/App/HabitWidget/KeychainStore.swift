import Foundation

/// The Supabase session, shared between the app and the widget via the
/// Keychain Access Group (not the App Group UserDefaults suite — long-lived
/// credentials belong in Keychain, not a plist). Written by the app's
/// WidgetBridgePlugin.syncAuthSession, read and refreshed independently by
/// the widget extension.
struct WidgetAuthSession: Codable {
    var accessToken: String
    var refreshToken: String
    var accessTokenExpiresAt: Date
    var userId: String

    var isAccessTokenValid: Bool {
        // 60s safety margin before actual expiry.
        accessTokenExpiresAt.timeIntervalSinceNow > 60
    }
}

enum KeychainStore {
    private static let account = "session"

    static func load() -> WidgetAuthSession? {
        var query = baseQuery()
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return try? WidgetJSONCoding.decoder.decode(WidgetAuthSession.self, from: data)
    }

    static func save(_ session: WidgetAuthSession) {
        guard let data = try? WidgetJSONCoding.encoder.encode(session) else { return }

        let query = baseQuery()
        let attributes: [String: Any] = [kSecValueData as String: data]

        let updateStatus = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if updateStatus == errSecItemNotFound {
            var newItem = query
            newItem[kSecValueData as String] = data
            newItem[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
            SecItemAdd(newItem as CFDictionary, nil)
        }
    }

    static func clear() {
        SecItemDelete(baseQuery() as CFDictionary)
    }

    private static func baseQuery() -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: WidgetConstants.keychainService,
            kSecAttrAccount as String: account,
            kSecAttrAccessGroup as String: WidgetConstants.keychainAccessGroup,
        ]
    }
}
