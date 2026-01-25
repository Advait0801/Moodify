import { moodDetectionClient } from "../clients/mood-detection.client";
import { recommendationClient } from "../clients/recommendation.client";
import { logger } from "../utils/logger.util";

export interface AnalyzeMoodRequest {
    imageBuffer: Buffer;
    userId: string;
}

export interface AnalyzeMoodResponse {
    emotion: {
        predicted: string;
        confidence: number;
        probabilities: Record<string, number>;
        face_detected: boolean;
    };
    recommendations: {
        tracks: Array<{
            id: string;
            name: string;
            artist: string;
            preview_url?: string;
        }>;
        playlist_id?: string;
    };
}

export const orchestrationService = {
    async analyzeMoodAndRecommend(request: AnalyzeMoodRequest): Promise<AnalyzeMoodResponse> {
        try {
            logger.info(`Analyzinf mood for user: ${request.userId}`);
            const moodResult = await moodDetectionClient.detectMood(request.imageBuffer);

            logger.info(`Getting recommendations for emotion: ${moodResult.predicted_emotion}`);
            const recommendations = await recommendationClient.getRecommendations({
                emotion: moodResult.predicted_emotion,
                confidence: moodResult.confidence,
                userId: request.userId,
            });

            return {
                emotion: {
                    predicted: moodResult.predicted_emotion,
                    confidence: moodResult.confidence,
                    probabilities: moodResult.emotion_probabilities,
                    face_detected: moodResult.face_detected,
                },
                recommendations: {
                    tracks: recommendations.tracks,
                    playlist_id: recommendations.playlist_id,
                },
            };
        } catch (error: any) {
            logger.error('Orchestration error:', error.message);
            throw error;
        }
    },
};