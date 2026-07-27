import AppIntents
import Foundation

/// Backs the widget's checkmark button. Calls the atomic
/// complete_habit_business Postgres RPC (see the migration of the same
/// name) directly — no completion business logic is duplicated here; that
/// was the entire point of building the RPC first (see the plan doc).
struct CompleteHabitIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Habit"
    static var isDiscoverable: Bool = false
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Habit ID")
    var habitId: String

    init() {}

    init(habitId: String) {
        self.habitId = habitId
    }

    func perform() async throws -> some IntentResult {
        do {
            try await complete()
        } catch {
            AppGroupStore.recordCompletionError(habitId: habitId)
        }
        AppGroupStore.reloadTimeline()
        return .result()
    }

    private func complete() async throws {
        let accessToken = try await SupabaseAuthClient.validAccessToken()

        let url = WidgetConstants.supabaseUrl.appendingPathComponent("rest/v1/rpc/complete_habit_business")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(WidgetConstants.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "p_habit_business_id": habitId,
            "p_occurred_at": ISO8601DateFormatter().string(from: Date()),
            "p_client_timezone": TimeZone.current.identifier,
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw CompleteHabitError.rpcFailed
        }
    }
}

enum CompleteHabitError: Error {
    case rpcFailed
}
