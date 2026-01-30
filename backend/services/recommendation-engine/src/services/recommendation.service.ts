import { spotifyClient } from "../clients/spotify.client";
import { emotionMapperService, EmotionMapping } from "./emotion-mapper.service";
import { recommendationRepository } from "../repositories/recommendation.repository";
import { fallbackProviderService } from "./fallback-provider.service";
import { explanationService } from "./explanation.service";
import { logger } from "../utils/logger.util";
import { config } from "../config/config";

export interface RecommendationRequest {
    emotion: string;
    confidence: number;
    userId: string;
    emotionProbabilities?: Record<string, number>;
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
    explanation?: string;
}

function getPrimaryEmotion(request: RecommendationRequest): string {
    const probs = request.emotionProbabilities;
    if(probs && Object.keys(probs).length > 0) {
        const primary = Object.entries(probs).sort((a, b) => b[1] - a[1])[0]?.[0];
        return primary ?? request.emotion;
    }
    return request.emotion;
}

export const recommendationService = {
    async getRecommendations(
        request: RecommendationRequest
    ): Promise<RecommendationResponse> {
        const useNeutralFallback = request.confidence < config.confidenceThreshold;

        let mapping: EmotionMapping;
        let primaryEmotion: string;

        if(useNeutralFallback) {
            mapping = emotionMapperService.getMapping('neutral');
            primaryEmotion = 'neutral';
            logger.info(
                `Low confidence (${request.confidence.toFixed(2)} < ${config.confidenceThreshold}); using neutral recommendations`
            );
        } else {
            const useBlending = request.emotionProbabilities && Object.keys(request.emotionProbabilities).length > 0;

            mapping = useBlending
                ? emotionMapperService.blendFromProbabilities(request.emotionProbabilities!)
                : emotionMapperService.getMapping(request.emotion);

            primaryEmotion = getPrimaryEmotion(request);
            logger.info(
                `Getting recommendations for emotion: ${primaryEmotion} ` + 
                (useBlending
                    ? `(blended from ${Object.keys(request.emotionProbabilities!).length} emotions)`
                    : `(confidence: ${request.confidence})`
                )
            )
        }
        
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

            let explanation: string | null = null;
            try {
                explanation = await explanationService.getExplanation({
                    primaryEmotion,
                    valence: mapping.valence,
                    energy: mapping.energy,
                    tracks: tracks.map((t) => ({ name: t.name, artist: t.artist})),
                });
            } catch {}

            logger.info('Successfully retrieved recommendations from Spotify');
            return {
                tracks,
                emotion: primaryEmotion,
                source: 'spotify',
                ...(explanation && { explanation }),
            };
        } catch (error: any) {
            logger.warn(`Spotify failed: ${error.message}`);

            try {
                const fallBackTracks = fallbackProviderService.getRecommendations(
                    primaryEmotion,
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
                    primaryEmotion,
                    trackIds
                );

                let explanation: string | null = null;
                try {
                    explanation = await explanationService.getExplanation({
                        primaryEmotion,
                        valence: mapping.valence,
                        energy: mapping.energy,
                        tracks: tracks.map((t) => ({ name: t.name, artist: t.artist})),
                    });
                } catch {}

                logger.info('Successfully retrieved recommendations from fallback provider');
                return {
                    tracks,
                    emotion: primaryEmotion,
                    source: 'fallback',
                    ...(explanation && { explanation }),
                };
            } catch (fallBackError: any) {
                logger.error('Both Spotify and fallback provider failed:', fallBackError.message);
                throw new Error('Failed to get recommendations from any provider');
            }
        }
    }
};