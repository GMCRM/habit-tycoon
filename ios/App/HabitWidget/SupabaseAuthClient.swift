import Foundation

enum SupabaseAuthError: Error {
    case notAuthenticated
    case refreshFailed
}

/// Plain URLSession auth against Supabase's GoTrue REST API — no SDK, since
/// the widget extension doesn't carry the Supabase JS/Swift client. Only
/// handles refreshing an existing session; sign-in itself always happens in
/// the main app.
enum SupabaseAuthClient {
    static func validAccessToken() async throws -> String {
        guard let session = KeychainStore.load() else {
            throw SupabaseAuthError.notAuthenticated
        }
        if session.isAccessTokenValid {
            return session.accessToken
        }
        let refreshed = try await refresh(session)
        return refreshed.accessToken
    }

    static func currentUserId() -> String? {
        KeychainStore.load()?.userId
    }

    /// Known race: Supabase refresh tokens are single-use, and the main app
    /// refreshes independently on its own cycle. If both sides race, the
    /// loser gets a 400 — re-read the Keychain once (the winner may have
    /// already rotated it) and retry before giving up. No cross-process
    /// locking; this is a rare, self-healing edge case.
    private static func refresh(_ session: WidgetAuthSession, retrying: Bool = false) async throws -> WidgetAuthSession {
        var url = WidgetConstants.supabaseUrl.appendingPathComponent("auth/v1/token")
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "refresh_token")]
        url = components.url!

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(WidgetConstants.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["refresh_token": session.refreshToken])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw SupabaseAuthError.refreshFailed }

        if http.statusCode != 200, !retrying,
           let latest = KeychainStore.load(), latest.refreshToken != session.refreshToken {
            return try await refresh(latest, retrying: true)
        }

        guard http.statusCode == 200 else { throw SupabaseAuthError.refreshFailed }

        struct TokenResponse: Decodable {
            struct UserPayload: Decodable { let id: String }
            let access_token: String
            let refresh_token: String
            let expires_in: Int
            let user: UserPayload?
        }
        let decoded = try JSONDecoder().decode(TokenResponse.self, from: data)
        let updated = WidgetAuthSession(
            accessToken: decoded.access_token,
            refreshToken: decoded.refresh_token,
            accessTokenExpiresAt: Date().addingTimeInterval(TimeInterval(decoded.expires_in)),
            userId: decoded.user?.id ?? session.userId
        )
        KeychainStore.save(updated)
        return updated
    }
}
