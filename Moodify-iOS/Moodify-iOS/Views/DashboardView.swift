//
//  DashboardView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @Environment(\.layoutMetrics) private var layout

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingXL) {
                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Welcome back\(viewModel.displayName.isEmpty ? "" : ", \(viewModel.displayName)")")
                        .font(.title2.bold())
                        .foregroundColor(Color("TextPrimary"))
                    Text("Analyze your mood with a photo or text and get personalized music recommendations.")
                        .font(.subheadline)
                        .foregroundColor(Color("TextSecondary"))
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        Label("Analyze Mood", systemImage: "arrow.right")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, layout.spacingM)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("Primary"))
                }
                .padding(layout.cardPadding)
                .background(Color("Surface"))
                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))

                HStack(spacing: layout.spacingM) {
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        VStack(alignment: .leading, spacing: layout.spacingM) {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                                .foregroundColor(Color("Primary"))
                            Text("Photo mood")
                                .font(.headline)
                                .foregroundColor(Color("TextPrimary"))
                            Text("Upload or capture a photo.")
                                .font(.caption)
                                .foregroundColor(Color("TextSecondary"))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(layout.cardPadding)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    .buttonStyle(.plain)
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        VStack(alignment: .leading, spacing: layout.spacingM) {
                            Image(systemName: "text.quote")
                                .font(.title2)
                                .foregroundColor(Color("Secondary"))
                            Text("Text mood")
                                .font(.headline)
                                .foregroundColor(Color("TextPrimary"))
                            Text("Describe how you feel.")
                                .font(.caption)
                                .foregroundColor(Color("TextSecondary"))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(layout.cardPadding)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    .buttonStyle(.plain)
                }

                if !viewModel.recent.isEmpty {
                    VStack(alignment: .leading, spacing: layout.spacingM) {
                        Text("Recent activity")
                            .font(.headline)
                            .foregroundColor(Color("TextPrimary"))
                        VStack(spacing: layout.spacingS) {
                            ForEach(viewModel.recent) { entry in
                                HStack {
                                    Text(entry.emotion)
                                        .font(.subheadline.weight(.medium))
                                        .padding(.horizontal, layout.spacingM)
                                        .padding(.vertical, layout.spacingS)
                                        .background(Color.moodifyMood(for: entry.emotion).opacity(0.2))
                                        .clipShape(Capsule())
                                    Text("\(entry.inputType == "photo" ? "Photo" : "Text") · \(entry.date.formatted(date: .abbreviated, time: .omitted))")
                                        .font(.caption)
                                        .foregroundColor(Color("TextSecondary"))
                                    Spacer()
                                }
                                .padding(.vertical, layout.spacingS)
                                .padding(.horizontal, layout.spacingM)
                                .background(Color("Surface"))
                                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                            }
                        }
                    }
                }
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Moodify")
        .onAppear { viewModel.loadRecent() }
    }
}
