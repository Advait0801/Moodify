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
            .onOpenURL { url in
                handleSpotifyCallback(url: url)
            }
        }
    }

    private func handleSpotifyCallback(url: URL) {
        guard url.scheme == "moodify", url.host == "auth", url.path == "/callback" else { return }
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        if let token = components?.queryItems?.first(where: { $0.name == "token" })?.value {
            Task { @MainActor in
                do {
                    let user = try await APIClient.shared.getProfile(token: token)
                    AuthStorage.shared.set(auth: AuthResponse(user: user, token: token, expiresIn: "7d"))
                } catch {}
            }
        }
        if components?.queryItems?.contains(where: { $0.name == "spotify" && $0.value == "connected" }) == true {
            // Connect flow completed; ProfileViewModel can refetch status
            NotificationCenter.default.post(name: .spotifyConnectCompleted, object: nil)
        }
    }
}

extension Notification.Name {
    static let spotifyConnectCompleted = Notification.Name("spotifyConnectCompleted")
}
