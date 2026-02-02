//
//  ResultsViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import AVFoundation
internal import Combine

@MainActor
final class ResultsViewModel: ObservableObject {
    @Published var playingTrack: Track?
    private var player: AVPlayer?

    func isSpotifyTrack(id: String) -> Bool {
        !id.hasPrefix("fallback-") && id.count == 22
    }

    func isPlayablePreview(_ url: String?) -> Bool {
        guard let u = url else { return false }
        return u.contains("p.scdn.co") || u.hasSuffix(".mp3")
    }

    func togglePlay(track: Track) {
        if playingTrack?.id == track.id {
            stop()
            return
        }
        if let urlString = track.previewUrl, isPlayablePreview(urlString), let url = URL(string: urlString) {
            player?.pause()
            player = AVPlayer(url: url)
            player?.play()
            playingTrack = track
        } else {
            playingTrack = track
        }
    }

    func stop() {
        player?.pause()
        player = nil
        playingTrack = nil
    }
}
