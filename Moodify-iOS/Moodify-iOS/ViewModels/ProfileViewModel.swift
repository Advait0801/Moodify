//
//  ProfileViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation
internal import Combine

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var currentPassword = ""
    @Published var newPassword = ""
    @Published var confirmPassword = ""
    @Published var passwordLoading = false
    @Published var pictureLoading = false
    @Published var errorMessage: String?
    @Published var history: [HistoryEntry] = []
    private let historyKey = "moodify_history"

    var authStorage: AuthStorage { AuthStorage.shared }
    var api: APIClient { APIClient.shared }
    var user: User? { authStorage.user }

    func loadHistory() {
        guard let data = UserDefaults.standard.data(forKey: historyKey),
              let list = try? JSONDecoder().decode([[String: String]].self, from: data) else {
            history = []
            return
        }
        history = list.reversed().enumerated().compactMap { i, dict in
            guard let emotion = dict["emotion"], let dateStr = dict["date"], let inputType = dict["inputType"] else { return nil }
            guard let date = ISO8601DateFormatter().date(from: dateStr) else { return nil }
            return HistoryEntry(id: "\(i)-\(dateStr)", emotion: emotion, date: date, inputType: inputType)
        }
    }

    func changePassword() async {
        guard !currentPassword.isEmpty, !newPassword.isEmpty, !confirmPassword.isEmpty else {
            errorMessage = "Fill in all password fields."
            return
        }
        guard newPassword.count >= 6 else {
            errorMessage = "New password must be at least 6 characters."
            return
        }
        guard newPassword == confirmPassword else {
            errorMessage = "New passwords do not match."
            return
        }
        passwordLoading = true
        errorMessage = nil
        defer { passwordLoading = false }
        do {
            try await api.changePassword(currentPassword: currentPassword, newPassword: newPassword)
            currentPassword = ""
            newPassword = ""
            confirmPassword = ""
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func updateProfilePicture(_ image: UIImage?) async {
        pictureLoading = true
        errorMessage = nil
        defer { pictureLoading = false }
        do {
            let dataUrl: String?
            if let img = image, let data = img.jpegData(compressionQuality: 0.6) {
                let base64 = data.base64EncodedString()
                dataUrl = "data:image/jpeg;base64,\(base64)"
            } else {
                dataUrl = nil
            }
            let updated = try await api.updateProfile(profilePicture: dataUrl)
            authStorage.setUser(updated)
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func clearError() {
        errorMessage = nil
    }
}
