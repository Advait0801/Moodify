//
//  MoodAnalyzeResponse.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import Foundation

struct MoodAnalyzeResponse: Codable {
    let emotion: Emotion
    let recommendations: Recommendations
}

struct Emotion: Codable {
    let predicted: String
    let confidence: Double
    let probabilities: [String: Double]
    let faceDetected: Bool

    enum CodingKeys: String, CodingKey {
        case predicted, confidence, probabilities
        case faceDetected = "face_detected"
    }
}

struct Recommendations: Codable {
    let tracks: [Track]
    let playlistId: String?
    let explanation: String?

    enum CodingKeys: String, CodingKey {
        case tracks, explanation
        case playlistId = "playlist_id"
    }
}

struct Track: Codable, Identifiable {
    let id: String
    let name: String
    let artist: String
    let previewUrl: String?
    let youtubeVideoId: String?

    enum CodingKeys: String, CodingKey {
        case id, name, artist
        case previewUrl = "preview_url"
        case youtubeVideoId = "youtube_video_id"
    }
}
