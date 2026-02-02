//
//  AppLayout.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct LayoutMetrics {
    let scale: CGFloat
    let width: CGFloat
    let height: CGFloat

    static let baseWidth: CGFloat = 390
    static let baseHeight: CGFloat = 844

    func scaled(_ value: CGFloat) -> CGFloat {
        value * scale
    }

    var spacingS: CGFloat { scaled(8) }
    var spacingM: CGFloat { scaled(16) }
    var spacingL: CGFloat { scaled(24) }
    var spacingXL: CGFloat { scaled(32) }
    var cardCorner: CGFloat { 16 }
    var cardPadding: CGFloat { scaled(20) }
}

private struct LayoutMetricsKey: EnvironmentKey {
    static let defaultValue = LayoutMetrics(scale: 1, width: LayoutMetrics.baseWidth, height: LayoutMetrics.baseHeight)
}

extension EnvironmentValues {
    var layoutMetrics: LayoutMetrics {
        get { self[LayoutMetricsKey.self] }
        set { self[LayoutMetricsKey.self] = newValue }
    }
}

extension Color {
    static func moodifyMood(for emotion: String) -> Color {
        let lower = emotion.lowercased()
        if lower.contains("happy") || lower.contains("joy") { return Color("MoodHappy") }
        if lower.contains("sad") || lower.contains("sorrow") { return Color("MoodSad") }
        if lower.contains("angry") || lower.contains("anger") { return Color("MoodAngry") }
        if lower.contains("neutral") { return Color("MoodNeutral") }
        return Color("Accent")
    }
}

struct LayoutMetricsReader<Content: View>: View {
    @ViewBuilder let content: (LayoutMetrics) -> Content

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let scaleW = w / LayoutMetrics.baseWidth
            let scaleH = h / LayoutMetrics.baseHeight
            let scale = min(max(min(scaleW, scaleH), 0.85), 1.2)
            content(LayoutMetrics(scale: scale, width: w, height: h))
        }
    }
}
