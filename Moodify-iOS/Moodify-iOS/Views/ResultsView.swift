//
//  ResultsView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI
import AVKit

struct ResultsView: View {
    let result: MoodAnalyzeResponse
    @StateObject private var viewModel = ResultsViewModel()
    @Environment(\.layoutMetrics) private var layout

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Detected mood")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    HStack {
                        Text(result.emotion.predicted)
                            .font(.subheadline.weight(.medium))
                            .padding(.horizontal, layout.spacingM)
                            .padding(.vertical, layout.spacingS)
                            .background(Color.moodifyMood(for: result.emotion.predicted).opacity(0.2))
                            .clipShape(Capsule())
                        Text("Confidence: \(Int(result.emotion.confidence * 100))%")
                            .font(.caption)
                            .foregroundColor(Color("TextSecondary"))
                        if !result.emotion.faceDetected {
                            Text("(no face detected)")
                                .font(.caption)
                                .foregroundColor(Color("TextSecondary"))
                        }
                    }
                }
                .padding(layout.cardPadding)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color("Surface"))
                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))

                if let explanation = result.recommendations.explanation, !explanation.isEmpty {
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("Why this music?")
                            .font(.headline)
                            .foregroundColor(Color("TextPrimary"))
                        Text(explanation)
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                    }
                    .padding(layout.cardPadding)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color("Surface"))
                    .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Recommended tracks")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    ForEach(result.recommendations.tracks) { track in
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(track.name)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundColor(Color("TextPrimary"))
                                    .lineLimit(1)
                                Text(track.artist)
                                    .font(.caption)
                                    .foregroundColor(Color("TextSecondary"))
                                    .lineLimit(1)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            Spacer()
                            if track.previewUrl != nil && viewModel.isPlayablePreview(track.previewUrl) || viewModel.isSpotifyTrack(id: track.id) {
                                Button {
                                    viewModel.togglePlay(track: track)
                                } label: {
                                    Text(viewModel.playingTrack?.id == track.id ? "Playing" : "Play")
                                        .font(.caption.weight(.medium))
                                        .padding(.horizontal, layout.spacingM)
                                        .padding(.vertical, layout.spacingS)
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(Color("Primary"))
                            }
                            if viewModel.isSpotifyTrack(id: track.id), let url = URL(string: "https://open.spotify.com/track/\(track.id)") {
                                Link(destination: url) {
                                    Image(systemName: "link")
                                        .font(.body)
                                        .foregroundColor(Color("Primary"))
                                }
                            }
                        }
                        .padding(layout.cardPadding)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    if result.recommendations.tracks.isEmpty {
                        Text("No tracks found.")
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                            .padding(layout.spacingM)
                    }
                }
            }
            .padding(layout.spacingM)
        }
        .padding(.bottom, layout.scaled(80))
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            viewModel.stop()
        }
    }
}
