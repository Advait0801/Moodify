//
//  AuthViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation
import AuthenticationServices
import UIKit
internal import Combine

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var username = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var isLoading = false
    @Published var errorMessage: String?

    var authStorage: AuthStorage { AuthStorage.shared }
    var api: APIClient { APIClient.shared }

    func loginWithSpotify() async {
        guard let authURL = URL(string: APIClient.shared.baseURL + "/auth/spotify?intent=login&returnTo=app") else {
            errorMessage = "Invalid URL"
            return
        }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let callbackURL = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<URL, Error>) in
                let provider = SpotifyAuthContextProvider()
                let session = ASWebAuthenticationSession(
                    url: authURL,
                    callbackURLScheme: "moodify"
                ) { url, error in
                    if let error = error {
                        continuation.resume(throwing: error)
                        return
                    }
                    guard let url = url else {
                        continuation.resume(throwing: APIError.invalidURL)
                        return
                    }
                    continuation.resume(returning: url)
                }
                session.prefersEphemeralWebBrowserSession = false
                session.presentationContextProvider = provider
                session.start()
            }
            guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
                  let token = components.queryItems?.first(where: { $0.name == "token" })?.value else {
                errorMessage = "Could not complete Spotify sign in."
                return
            }
            let user = try await api.getProfile(token: token)
            authStorage.set(auth: AuthResponse(user: user, token: token, expiresIn: "7d"))
        } catch let error as ASWebAuthenticationSessionError where error.code == .canceledLogin {
            // User cancelled
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func login() async {
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty, !password.isEmpty else {
            errorMessage = "Email or username and password are required."
            return
        }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response = try await api.login(LoginDto(email: email.trimmingCharacters(in: .whitespaces), password: password))
            authStorage.set(auth: response)
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func register() async {
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty,
              !username.trimmingCharacters(in: .whitespaces).isEmpty,
              !password.isEmpty else {
            errorMessage = "Email, username and password are required."
            return
        }
        guard password.count >= 6 else {
            errorMessage = "Password must be at least 6 characters."
            return
        }
        guard password == confirmPassword else {
            errorMessage = "Passwords do not match."
            return
        }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response = try await api.register(RegisterDto(
                email: email.trimmingCharacters(in: .whitespaces),
                username: username.trimmingCharacters(in: .whitespaces),
                password: password
            ))
            authStorage.set(auth: response)
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func clearError() {
        errorMessage = nil
    }
}
