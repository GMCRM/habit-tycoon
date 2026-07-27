import Foundation

/// Mirrors src/app/shared/business-icon.util.ts's BUSINESS_ICON_ASSETS map.
/// A third place (alongside the TS map and the business_types seed
/// migration) that needs a manual update whenever a business type/icon is
/// added — small enough at 10 entries to be a code-review checklist item
/// rather than tooling.
enum BusinessIconAssets {
    static let map: [String: String] = [
        "🍋": "lemonade-stand",
        "📰": "newspaper-route",
        "🚗": "car-wash",
        "🍕": "pizza-delivery",
        "🍩": "donut-shop",
        "🦐": "shrimp-boat",
        "🏒": "hockey-team",
        "🎬": "movie-studio",
        "🏦": "bank",
        "🛢️": "oil-company",
    ]

    static func assetName(for emoji: String) -> String? {
        map[emoji]
    }
}
