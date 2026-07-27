import SwiftUI
import WidgetKit
import AppIntents

struct HabitRowView: View {
    let habit: WidgetHabit
    let isComplete: Bool
    let hasError: Bool
    var compact: Bool = false

    var body: some View {
        HStack(spacing: compact ? 10 : 14) {
            iconView
            Text(habit.businessName)
                .font(.system(compact ? .subheadline : .headline, design: .rounded).weight(.bold))
                .foregroundColor(Color("GoldText"))
                .lineLimit(compact ? 1 : 2)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 4)
            checkmarkButton
        }
    }

    @ViewBuilder
    private var iconView: some View {
        let size: CGFloat = compact ? 32 : 44
        if let assetName = BusinessIconAssets.assetName(for: habit.businessIcon) {
            Image(assetName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
                .clipShape(RoundedRectangle(cornerRadius: size * 0.2))
        } else {
            Text(habit.businessIcon)
                .font(.system(size: size * 0.7))
                .frame(width: size, height: size)
        }
    }

    @ViewBuilder
    private var checkmarkButton: some View {
        let diameter: CGFloat = compact ? 30 : 38

        if hasError {
            ZStack {
                Circle().fill(Color.red.opacity(0.85))
                Image(systemName: "exclamationmark")
                    .font(.system(size: diameter * 0.45, weight: .bold))
                    .foregroundColor(.white)
            }
            .frame(width: diameter, height: diameter)
        } else if isComplete {
            ZStack {
                Circle()
                    .fill(Color("NavyCard"))
                    .overlay(Circle().stroke(Color.white.opacity(0.3), lineWidth: 1))
                Image(systemName: "checkmark")
                    .font(.system(size: diameter * 0.45, weight: .bold))
                    .foregroundColor(.white.opacity(0.6))
            }
            .frame(width: diameter, height: diameter)
        } else {
            Button(intent: CompleteHabitIntent(habitId: habit.id)) {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .shadow(color: .yellow.opacity(0.6), radius: 6)
                    Image(systemName: "checkmark")
                        .font(.system(size: diameter * 0.45, weight: .bold))
                        .foregroundColor(Color("NavyCard"))
                }
                .frame(width: diameter, height: diameter)
            }
            .buttonStyle(.plain)
        }
    }
}
