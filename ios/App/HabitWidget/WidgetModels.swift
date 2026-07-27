import Foundation

/// Mirrors the JSON shape WidgetBridgePlugin.syncHabits writes into the App
/// Group's shared UserDefaults suite. Field names are snake_case to match
/// what the TS side (HabitCacheService) passes through largely as-is from
/// Supabase — keep this in sync with WidgetBridgePlugin.swift's write side.
struct WidgetHabitSnapshot: Codable {
    let habits: [WidgetHabit]
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case habits
        case updatedAt = "updated_at"
    }
}

struct WidgetHabit: Codable, Identifiable, Hashable {
    let id: String
    let businessName: String
    let businessIcon: String
    let currentProgress: Int
    let goalValue: Int
    let streak: Int
    let lastCompletedAt: Date?
    let recurrenceInterval: String
    let activeDays: [Int]?
    let displayOrder: Int
    let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case businessName = "business_name"
        case businessIcon = "business_icon"
        case currentProgress = "current_progress"
        case goalValue = "goal_value"
        case streak
        case lastCompletedAt = "last_completed_at"
        case recurrenceInterval = "recurrence_interval"
        case activeDays = "active_days"
        case displayOrder = "display_order"
        case isActive = "is_active"
    }
}

/// A transient "this completion attempt failed" marker (see
/// WidgetConstants.lastCompletionErrorKey). Age-checked and self-expiring —
/// no separate "clear" write needed.
struct WidgetCompletionError: Codable {
    let habitId: String
    let occurredAt: Date

    var isStale: Bool {
        Date().timeIntervalSince(occurredAt) > 10
    }
}

enum WidgetJSONCoding {
    static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let raw = try container.decode(String.self)
            // Postgres/PostgREST emits timestamptz with microsecond precision
            // (e.g. ".123456", sometimes fewer digits with trailing zeros
            // stripped) — ISO8601DateFormatter's .withFractionalSeconds only
            // accepts exactly 3 digits (milliseconds) and fails to parse
            // anything else, silently. Strip any fractional-seconds
            // component (any digit count) before parsing rather than trying
            // to match Postgres's variable precision exactly — we don't
            // need sub-second granularity for period/streak checks anyway.
            let normalized = ISO8601DateFormatter.stripFractionalSeconds(raw)
            if let date = ISO8601DateFormatter.withoutFractionalSeconds.date(from: normalized) {
                return date
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unrecognized date format: \(raw)")
        }
        return decoder
    }()

    static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .custom { date, encoder in
            var container = encoder.singleValueContainer()
            try container.encode(ISO8601DateFormatter.withoutFractionalSeconds.string(from: date))
        }
        return encoder
    }()
}

private extension ISO8601DateFormatter {
    static let withoutFractionalSeconds: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    static func stripFractionalSeconds(_ raw: String) -> String {
        guard let dotIndex = raw.firstIndex(of: ".") else { return raw }
        var endIndex = raw.index(after: dotIndex)
        while endIndex < raw.endIndex, raw[endIndex].isNumber {
            endIndex = raw.index(after: endIndex)
        }
        var result = raw
        result.removeSubrange(dotIndex..<endIndex)
        return result
    }
}
