//
//  DashboardViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation
internal import Combine

struct HistoryEntry: Identifiable {
    let id: String
    let emotion: String
    let date: Date
    let inputType: String
}

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var recent: [HistoryEntry] = []
    private let historyKey = "moodify_history"

    var user: User? { AuthStorage.shared.user }

    var displayName: String {
        guard let u = user else { return "" }
        if let name = u.username, !name.isEmpty { return name }
        return u.email.split(separator: "@").first.map(String.init) ?? ""
    }

    func loadRecent() {
        guard let data = UserDefaults.standard.data(forKey: historyKey),
              let list = try? JSONDecoder().decode([[String: String]].self, from: data) else {
            recent = []
            return
        }
        recent = list.suffix(5).reversed().enumerated().compactMap { i, dict in
            guard let emotion = dict["emotion"], let dateStr = dict["date"], let inputType = dict["inputType"] else { return nil }
            guard let date = ISO8601DateFormatter().date(from: dateStr) else { return nil }
            return HistoryEntry(id: "\(i)-\(dateStr)", emotion: emotion, date: date, inputType: inputType)
        }
    }
}
