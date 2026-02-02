//
//  AuthResponse.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation

struct AuthResponse: Codable {
    let user: User
    let token: String
    let expiresIn: String
}

struct LoginDto: Encodable {
    let email: String
    let password: String
}

struct RegisterDto: Encodable {
    let email: String
    let username: String
    let password: String
}
