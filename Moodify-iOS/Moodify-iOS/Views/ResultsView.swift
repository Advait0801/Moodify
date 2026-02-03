import SwiftUI
import AVKit

struct ResultsView: View {
    let result: MoodAnalyzeResponse
    @StateObject private var viewModel = ResultsViewModel()
    @Environment(\.layoutMetrics) private var layout

    private func formatTime(_ sec: Double) -> String {
        guard sec.isFinite, !sec.isNaN, sec >= 0 else { return "0:00" }
        let m = Int(sec) / 60
        let s = Int(sec) % 60
        return "\(m):\(String(format: "%02d", s))"
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: layout.spacingL) {
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("Detected mood")
                            .font(.headline)
                            .foregroundColor(Color("TextPrimary"))
                        HStack(spacing: layout.spacingS) {
                            Text(result.emotion.predicted)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, layout.spacingM)
                                .padding(.vertical, layout.spacingS)
                                .background(Color.moodifyMood(for: result.emotion.predicted).opacity(0.25))
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
                    .background(
                        RoundedRectangle(cornerRadius: layout.cardCorner)
                            .fill(Color("Surface"))
                            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                    )

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
                        .background(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .fill(Color("Surface"))
                                .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                        )
                    }

                    VStack(alignment: .leading, spacing: layout.spacingM) {
                        Text("Recommended tracks")
                            .font(.headline)
                            .foregroundColor(Color("TextPrimary"))
                        ForEach(result.recommendations.tracks) { track in
                            HStack(spacing: layout.spacingM) {
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
                                Spacer(minLength: 8)
                                if viewModel.isPlayablePreview(track.previewUrl) {
                                    Button {
                                        viewModel.togglePlay(track: track)
                                    } label: {
                                        Image(systemName: viewModel.playingTrack?.id == track.id && viewModel.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                            .font(.title2)
                                            .foregroundColor(Color("Primary"))
                                    }
                                    .buttonStyle(.plain)
                                }
                                if viewModel.isSpotifyTrack(id: track.id), let url = URL(string: "https://open.spotify.com/track/\(track.id)") {
                                    Link(destination: url) {
                                        Image(systemName: "link.circle.fill")
                                            .font(.title2)
                                            .foregroundColor(Color("Secondary"))
                                    }
                                }
                                if viewModel.isYouTubeTrack(track: track) {
                                    if let vid = track.youtubeVideoId, let url = URL(string: "https://www.youtube.com/watch?v=\(vid)") {
                                        Link(destination: url) {
                                            Image(systemName: "play.rectangle.fill")
                                                .font(.title2)
                                                .foregroundColor(Color("Accent"))
                                        }
                                    } else if let u = track.previewUrl, let url = URL(string: u) {
                                        Link(destination: url) {
                                            Image(systemName: "play.rectangle.fill")
                                                .font(.title2)
                                                .foregroundColor(Color("Accent"))
                                        }
                                    }
                                }
                            }
                            .padding(layout.cardPadding)
                            .background(
                                RoundedRectangle(cornerRadius: layout.cardCorner)
                                    .fill(Color("Surface"))
                                    .shadow(color: .black.opacity(0.05), radius: 6, x: 0, y: 2)
                            )
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
                .padding(.bottom, viewModel.playingTrack != nil ? layout.scaled(140) : layout.scaled(24))
            }
            .scrollContentBackground(.hidden)
            .background(Color("Background"))

            if let track = viewModel.playingTrack {
                VStack(spacing: 0) {
                    Rectangle()
                        .fill(Color("Divider"))
                        .frame(height: 1)
                    VStack(spacing: layout.spacingS) {
                        HStack(spacing: layout.spacingM) {
                            if viewModel.isPlayablePreview(track.previewUrl) {
                                Button {
                                    viewModel.togglePausePlay()
                                } label: {
                                    Image(systemName: viewModel.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                        .font(.system(size: 44))
                                        .foregroundColor(Color("Primary"))
                                }
                                .buttonStyle(.plain)
                            }
                            VStack(alignment: .leading, spacing: 2) {
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
                            if viewModel.isPlayablePreview(track.previewUrl) {
                                Text("\(formatTime(viewModel.currentTime)) / \(formatTime(viewModel.duration))")
                                    .font(.caption2)
                                    .foregroundColor(Color("TextSecondary"))
                            }
                            Button {
                                viewModel.stop()
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(Color("TextSecondary"))
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal, layout.spacingM)
                        .padding(.top, layout.spacingS)
                        if viewModel.isPlayablePreview(track.previewUrl), viewModel.duration > 0 {
                            Slider(value: Binding(
                                get: { viewModel.currentTime },
                                set: { viewModel.seek(to: $0) }
                            ), in: 0...max(1, viewModel.duration))
                            .tint(Color("Primary"))
                            .padding(.horizontal, layout.spacingM)
                            .padding(.bottom, layout.spacingS)
                        }
                        if !viewModel.isPlayablePreview(track.previewUrl) {
                            HStack(spacing: layout.spacingS) {
                                if viewModel.isSpotifyTrack(id: track.id), let url = URL(string: "https://open.spotify.com/track/\(track.id)") {
                                    Link(destination: url) {
                                        Label("Open in Spotify", systemImage: "link")
                                            .font(.caption.weight(.medium))
                                            .foregroundColor(Color("Primary"))
                                    }
                                }
                                if viewModel.isYouTubeTrack(track: track) {
                                    if let vid = track.youtubeVideoId, let url = URL(string: "https://www.youtube.com/watch?v=\(vid)") {
                                        Link(destination: url) {
                                            Label("Open in YouTube", systemImage: "play.rectangle")
                                                .font(.caption.weight(.medium))
                                                .foregroundColor(Color("Accent"))
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, layout.spacingM)
                            .padding(.bottom, layout.spacingS)
                        }
                    }
                    .padding(.bottom, layout.spacingM)
                    .background(Color("Surface").opacity(0.98))
                }
                .background(.ultraThinMaterial)
            }
        }
        .navigationTitle("Results")
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            viewModel.stop()
        }
    }
}
