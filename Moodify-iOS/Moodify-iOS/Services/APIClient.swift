//
//  APIClient.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case network(Error)
    case status(Int, String?)
    case decode(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .network(let e): return e.localizedDescription
        case .status(let code, let msg): return msg ?? "Request failed: \(code)"
        case .decode(let e): return "Invalid response: \(e.localizedDescription)"
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    var baseURL: String = "https://dnzceqc6uohqj.cloudfront.net"
    private let session: URLSession

    private init(session: URLSession = .shared) {
        self.session = session
    }

    func request<T: Decodable>(
        _ path: String,
        method: String = "GET",
        body: Data? = nil,
        token: String? = nil
    ) async throws -> T {
        guard let url = URL(string: baseURL + path) else { throw APIError.invalidURL }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = token ?? AuthStorage.shared.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.network(error)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.status(0, "Invalid response")
        }
        if http.statusCode == 401 {
            AuthStorage.shared.clear()
        }
        guard http.statusCode >= 200, http.statusCode < 300 else {
            let message = (try? JSONDecoder().decode([String: String].self, from: data))["error"]
            throw APIError.status(http.statusCode, message)
        }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decode(error)
        }
    }

    func login(_ dto: LoginDto) async throws -> AuthResponse {
        let body = try JSONEncoder().encode(dto)
        return try await request("/auth/login", method: "POST", body: body, token: nil)
    }

    func register(_ dto: RegisterDto) async throws -> AuthResponse {
        let body = try JSONEncoder().encode(dto)
        return try await request("/auth/register", method: "POST", body: body, token: nil)
    }

    func getProfile() async throws -> User {
        return try await request("/users/me", token: AuthStorage.shared.token)
    }

    func updateProfile(profilePicture: String?) async throws -> User {
        struct Payload: Encodable {
            let profile_picture: String?
        }
        let body = try JSONEncoder().encode(Payload(profile_picture: profilePicture))
        return try await request("/users/me", method: "PATCH", body: body)
    }

    func changePassword(currentPassword: String, newPassword: String) async throws {
        struct Payload: Encodable {
            let currentPassword: String
            let newPassword: String
        }
        let body = try JSONEncoder().encode(Payload(currentPassword: currentPassword, newPassword: newPassword))
        let _: EmptyResponse = try await request("/users/me/password", method: "POST", body: body)
    }

    func analyzeMood(imageData: Data) async throws -> MoodAnalyzeResponse {
        guard let url = URL(string: baseURL + "/mood/analyze") else { throw APIError.invalidURL }
        let boundary = UUID().uuidString
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        if let token = AuthStorage.shared.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.status(0, "Invalid response") }
        if http.statusCode == 401 { AuthStorage.shared.clear() }
        guard http.statusCode >= 200, http.statusCode < 300 else {
            let message = (try? JSONDecoder().decode([String: String].self, from: data))["error"]
            throw APIError.status(http.statusCode, message)
        }
        return try JSONDecoder().decode(MoodAnalyzeResponse.self, from: data)
    }

    func analyzeMoodFromText(_ text: String) async throws -> MoodAnalyzeResponse {
        struct Payload: Encodable { let text: String }
        let body = try JSONEncoder().encode(Payload(text: text))
        return try await request("/mood/analyze/text", method: "POST", body: body)
    }
}

private struct EmptyResponse: Decodable {}
