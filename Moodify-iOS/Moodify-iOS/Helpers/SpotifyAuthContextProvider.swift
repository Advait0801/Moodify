//
//  SpotifyAuthContextProvider.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/24/26.
//

import AuthenticationServices
import UIKit

final class SpotifyAuthContextProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        for scene in UIApplication.shared.connectedScenes {
            guard let windowScene = scene as? UIWindowScene else { continue }
            for window in windowScene.windows where window.isKeyWindow {
                return window
            }
            if let window = windowScene.windows.first { return window }
        }
        fatalError("No window available for Spotify auth")
    }
}
