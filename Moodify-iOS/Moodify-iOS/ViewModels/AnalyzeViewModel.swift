//
//  AnalyzeViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI
internal import Combine

enum AnalyzeMode {
    case photo
    case text
}

@MainActor
final class AnalyzeViewModel: ObservableObject {
    @Published var mode: AnalyzeMode = .photo
    @Published var text = ""
    @Published var image: UIImage?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var result: MoodAnalyzeResponse?

    var api: APIClient { APIClient.shared }

    var canSubmit: Bool {
        switch mode {
        case .photo: return image != nil
        case .text: return !text.trimmingCharacters(in: .whitespaces).isEmpty
        }
    }

    func submit() async {
        errorMessage = nil
        switch mode {
        case .photo:
            guard let img = image, let data = img.jpegData(compressionQuality: 0.8) else {
                errorMessage = "Please select or capture an image."
                return
            }
            isLoading = true
            defer { isLoading = false }
            do {
                let r = try await api.analyzeMood(imageData: data)
                result = r
                saveToHistory(r)
            } catch {
                errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            }
        case .text:
            let trimmed = text.trimmingCharacters(in: .whitespaces)
            guard !trimmed.isEmpty else {
                errorMessage = "Please describe how you feel."
                return
            }
            isLoading = true
            defer { isLoading = false }
            do {
                let r = try await api.analyzeMoodFromText(trimmed)
                result = r
                saveToHistory(r)
            } catch {
                errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
            }
        }
    }

    private func saveToHistory(_ r: MoodAnalyzeResponse) {
        let historyKey = "moodify_history"
        let inputType = mode == .photo ? "photo" : "text"
        let entry: [String: String] = [
            "emotion": r.emotion.predicted,
            "date": ISO8601DateFormatter().string(from: Date()),
            "inputType": inputType
        ]
        var list = (UserDefaults.standard.data(forKey: historyKey).flatMap { try? JSONDecoder().decode([[String: String]].self, from: $0) }) ?? []
        list.append(entry)
        if list.count > 50 { list = Array(list.suffix(50)) }
        if let data = try? JSONEncoder().encode(list) {
            UserDefaults.standard.set(data, forKey: historyKey)
        }
    }

    func clearError() {
        errorMessage = nil
    }

    func clearResult() {
        result = nil
    }
}
