import { spotifyClient } from "../clients/spotify.client";
import { emotionMapperService } from "./emotion-mapper.service";
import { recommendationRepository } from "../repositories/recommendation.repository";
import { fallbackProviderService } from "./fallback-provider.service";
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
    source?: 'spotify' | 'fallback';
}

export const recommendationService = {
    async getRecommendations(
        request: RecommendationRequest
    ): Promise<RecommendationResponse> {
        const mapping = emotionMapperService.getMapping(request.emotion);
        logger.info(
            `Getting recommendations for emotion: ${request.emotion} ` +
            `(confidence: ${request.confidence})`
        );

        try {
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

            logger.info('Successfully retrieved recommendations from Spotify');
            return {
                tracks,
                emotion: request.emotion,
                source: 'spotify',
            };
        } catch (error: any) {
            logger.warn(`Spotify failed: ${error.message}`);

            try {
                const fallBackTracks = fallbackProviderService.getRecommendations(
                    request.emotion,
                    20
                );

                const tracks = fallBackTracks.map((track) => ({
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

                logger.info('Successfully retrieved recommendations from fallback provider');
                return {
                    tracks,
                    emotion: request.emotion,
                    source: 'fallback'
                };
            } catch (fallBackError: any) {
                logger.error('Both Spotify and fallback provider failed:', fallBackError.message);
                throw new Error('Failed to get recommendations from any provider');
            }
        }
    }
};