//
//  Moodify_iOSApp.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

@main
struct MoodifyApp: App {
    var body: some Scene {
        WindowGroup {
            LayoutMetricsReader { metrics in
                ContentView()
                    .environment(\.layoutMetrics, metrics)
                    .preferredColorScheme(nil)
            }
            .background(Color("Background"))
        }
    }
}
