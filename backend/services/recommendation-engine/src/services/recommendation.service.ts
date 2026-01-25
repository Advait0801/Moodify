import { spotifyClient } from "../clients/spotify.client";
import { emotionMapperService } from "./emotion-mapper.service";
import { recommendationRepository } from "../repositories/recommendation.repository";
import { logger } from "../utils/logger.util";

export interface RecommendationRequest {
    emotion: string;
    confidence: number;
    userId: string;
}

export interface RecommendationResponse {
    playlist_id?: string;
    tracks: Array<{
        id: string;
        name: string;
        artist: string;
        preview_url?: string;
    }>;
    emotion: string;
}

export const recommendationService = {
    async getRecommendations(
        request: RecommendationRequest
    ): Promise<RecommendationResponse> {
        try {
            const mapping = emotionMapperService.getMapping(request.emotion);
            logger.info(
                `Getting recommendations for emotion: ${request.emotion} ` + 
                `(confidence: ${request.confidence})`
            );

            const spotifyTracks = await spotifyClient.getRecommendations(
                mapping.genres,
                mapping.energy,
                mapping.valence,
                mapping.danceability,
                20
            );

            const tracks = spotifyTracks.map((track) => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0]?.name || 'Unknown',
                preview_url: track.preview_url || undefined,
            }));

            const trackIds = tracks.map((t) => t.id);

            await recommendationRepository.create(
                request.userId,
                request.emotion,
                trackIds
            );

            return {
                tracks,
                emotion: request.emotion,
            };
        } catch (error: any) {
            logger.error('Recommendation service error:', error.message);
            throw error;
        }
    }
}