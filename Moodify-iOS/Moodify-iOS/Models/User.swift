//
//  User.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation

struct User: Codable, Equatable {
    let id: String
    let email: String
    let username: String?
    let profilePicture: String?
}
