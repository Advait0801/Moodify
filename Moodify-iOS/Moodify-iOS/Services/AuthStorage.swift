//
//  AuthStorage.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation
internal import Combine

final class AuthStorage: ObservableObject {
    static let shared = AuthStorage()
    private let tokenKey = "moodify_token"
    private let userKey = "moodify_user"

    @Published private(set) var token: String?
    @Published private(set) var user: User?

    var isLoggedIn: Bool { token != nil }

    private init() {
        token = UserDefaults.standard.string(forKey: tokenKey)
        if let data = UserDefaults.standard.data(forKey: userKey),
           let u = try? JSONDecoder().decode(User.self, from: data) {
            user = u
        } else {
            user = nil
        }
    }

    func set(auth: AuthResponse) {
        token = auth.token
        user = auth.user
        UserDefaults.standard.set(auth.token, forKey: tokenKey)
        if let data = try? JSONEncoder().encode(auth.user) {
            UserDefaults.standard.set(data, forKey: userKey)
        }
    }

    func setUser(_ u: User) {
        user = u
        if let data = try? JSONEncoder().encode(u) {
            UserDefaults.standard.set(data, forKey: userKey)
        }
    }

    func clear() {
        token = nil
        user = nil
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: userKey)
    }
}
