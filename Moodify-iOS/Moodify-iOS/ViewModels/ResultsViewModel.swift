//
//  ResultsViewModel.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation
import AVFoundation
internal import Combine

@MainActor
final class ResultsViewModel: ObservableObject {
    @Published var playingTrack: Track?
    @Published var isPlaying = false
    @Published var currentTime: Double = 0
    @Published var duration: Double = 0
    private var player: AVPlayer?
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?

    func isSpotifyTrack(id: String) -> Bool {
        !id.hasPrefix("fallback-") && id.count == 22
    }

    func isPlayablePreview(_ url: String?) -> Bool {
        guard let u = url, !u.isEmpty else { return false }
        guard u.lowercased().hasPrefix("http") else { return false }
        if u.contains("youtube.com") || u.contains("youtu.be") { return false }
        return u.contains("p.scdn.co") || u.contains("scdn.co") || u.hasSuffix(".mp3") || u.contains("mp3")
    }

    func isYouTubeTrack(track: Track) -> Bool {
        if track.youtubeVideoId != nil { return true }
        guard let u = track.previewUrl else { return false }
        return u.contains("youtube.com") || u.contains("youtu.be")
    }

    func togglePlay(track: Track) {
        if playingTrack?.id == track.id {
            if isPlayablePreview(track.previewUrl) {
                if isPlaying {
                    player?.pause()
                    isPlaying = false
                } else {
                    player?.play()
                    isPlaying = true
                }
            } else {
                stop()
            }
            return
        }
        stop()
        if let urlString = track.previewUrl, isPlayablePreview(urlString), let url = URL(string: urlString) {
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
                try AVAudioSession.sharedInstance().setActive(true)
            } catch {}
            player?.pause()
            let newPlayer = AVPlayer(url: url)
            player = newPlayer
            playingTrack = track
            isPlaying = true
            duration = 30
            currentTime = 0
            addTimeObserver()
            endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: newPlayer.currentItem, queue: .main) { [weak self] _ in
                guard let self else { return }
                Task { @MainActor [weak self] in
                    self?.isPlaying = false
                }
            }
            if let currentItem = newPlayer.currentItem {
                let asset = currentItem.asset
                Task { [weak self] in
                    do {
                        let dur = try await asset.load(.duration)
                        await MainActor.run {
                            guard let self else { return }
                            // Ensure we're still working with the same current item
                            guard let item = self.player?.currentItem, item.asset == asset else { return }
                            if dur.isNumeric && !dur.isIndefinite {
                                self.duration = CMTimeGetSeconds(dur)
                            }
                        }
                    } catch {
                        // Ignore errors; keep default duration
                    }
                }
            }
            newPlayer.play()
        } else {
            playingTrack = track
            isPlaying = false
        }
    }

    private func addTimeObserver() {
        removeTimeObserver()
        guard let p = player else { return }
        let interval = CMTime(seconds: 0.5, preferredTimescale: 600)
        timeObserver = p.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            Task { @MainActor [weak self] in
                self?.currentTime = CMTimeGetSeconds(time)
            }
        }
    }

    private func removeTimeObserver() {
        if let obs = timeObserver, let p = player {
            p.removeTimeObserver(obs)
        }
        timeObserver = nil
    }

    func seek(to time: Double) {
        guard let p = player else { return }
        p.seek(to: CMTime(seconds: time, preferredTimescale: 600))
        currentTime = time
    }

    func togglePausePlay() {
        guard playingTrack != nil, isPlayablePreview(playingTrack?.previewUrl) else { return }
        if isPlaying {
            player?.pause()
            isPlaying = false
        } else {
            player?.play()
            isPlaying = true
        }
    }

    func stop() {
        removeTimeObserver()
        if let o = endObserver {
            NotificationCenter.default.removeObserver(o)
        }
        endObserver = nil
        player?.pause()
        player = nil
        playingTrack = nil
        isPlaying = false
        currentTime = 0
        duration = 0
    }
}

