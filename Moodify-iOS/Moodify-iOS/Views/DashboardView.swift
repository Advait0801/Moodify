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
                        .font(.title.bold())
                        .foregroundColor(Color("TextPrimary"))
                    Text("Analyze your mood with a photo or text and get personalized music recommendations.")
                        .font(.subheadline)
                        .foregroundColor(Color("TextSecondary"))
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        HStack {
                            Text("Analyze Mood")
                            Spacer()
                            Image(systemName: "arrow.right")
                                .font(.subheadline.weight(.semibold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, layout.spacingM)
                        .padding(.horizontal, layout.spacingM)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("Primary"))
                    .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                .padding(layout.cardPadding)
                .background(
                    RoundedRectangle(cornerRadius: layout.cardCorner)
                        .fill(
                            LinearGradient(colors: [Color("Surface"), Color("Primary").opacity(0.08)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                        .shadow(color: Color("Primary").opacity(0.15), radius: 12, x: 0, y: 6)
                )

                HStack(spacing: layout.spacingM) {
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        VStack(alignment: .leading, spacing: layout.spacingM) {
                            Image(systemName: "camera.fill")
                                .font(.title)
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
                        .background(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .fill(Color("Surface"))
                                .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                        )
                    }
                    .buttonStyle(.plain)
                    NavigationLink {
                        AnalyzeView()
                    } label: {
                        VStack(alignment: .leading, spacing: layout.spacingM) {
                            Image(systemName: "text.quote")
                                .font(.title)
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
                        .background(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .fill(Color("Surface"))
                                .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                        )
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
                                HStack(spacing: layout.spacingM) {
                                    Text(entry.emotion)
                                        .font(.subheadline.weight(.medium))
                                        .padding(.horizontal, layout.spacingM)
                                        .padding(.vertical, layout.spacingS)
                                        .background(Color.moodifyMood(for: entry.emotion).opacity(0.25))
                                        .clipShape(Capsule())
                                    Text("\(entry.inputType == "photo" ? "Photo" : "Text") · \(entry.date.formatted(date: .abbreviated, time: .omitted))")
                                        .font(.caption)
                                        .foregroundColor(Color("TextSecondary"))
                                    Spacer()
                                }
                                .padding(.vertical, layout.spacingS)
                                .padding(.horizontal, layout.spacingM)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color("Surface"))
                                        .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
                                )
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
