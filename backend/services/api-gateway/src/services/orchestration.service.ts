import { moodDetectionClient } from "../clients/mood-detection.client";
import { recommendationClient } from "../clients/recommendation.client";
import { redisClient } from "../clients/redis.client";
import { averageEmotionProbabilities } from "../utils/mood-smoothing.util";
import { logger } from "../utils/logger.util";
import { config } from "../config/config";

const windowSize = config.moodSmoothing?.windowSize ?? 3;

export interface MoodResult {
    predicted_emotion: string;
    confidence: number;
    emotion_probabilities: Record<string, number>;
    face_detected?: boolean;
}

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
            youtube_video_id?: string;
        }>;
        playlist_id?: string;
        explanation?: string;
    };
}

async function analyzeAndRecommendForMood(
    userId: string,
    moodResult: MoodResult
): Promise<AnalyzeMoodResponse> {
    await redisClient.pushMood(userId, moodResult.emotion_probabilities, windowSize);
    const recent = await redisClient.getRecentMoods(userId, windowSize);
    const smoothedProbs =
        recent.length > 0
            ? averageEmotionProbabilities(recent)
            : moodResult.emotion_probabilities;

    logger.info(
        `Getting recommendations for emotion: ${moodResult.predicted_emotion}` +
        (recent.length > 1 ? ` (smoothed over ${recent.length} moods)` : '')
    );
    const recommendations = await recommendationClient.getRecommendations({
        emotion: moodResult.predicted_emotion,
        confidence: moodResult.confidence,
        userId,
        emotionProbabilities: smoothedProbs,
    });

    return {
        emotion: {
            predicted: moodResult.predicted_emotion,
            confidence: moodResult.confidence,
            probabilities: moodResult.emotion_probabilities,
            face_detected: moodResult.face_detected ?? false,
        },
        recommendations: {
            tracks: recommendations.tracks ?? [],
            playlist_id: recommendations.playlist_id,
            ...(recommendations.explanation && { explanation: recommendations.explanation }),
        },
    };
}

export const orchestrationService = {
    async analyzeMoodAndRecommend(request: AnalyzeMoodRequest): Promise<AnalyzeMoodResponse> {
        try {
            logger.info(`Analyzing mood for user: ${request.userId}`);
            const moodResult = await moodDetectionClient.detectMood(request.imageBuffer);
            return analyzeAndRecommendForMood(request.userId, {
                ...moodResult,
                face_detected: moodResult.face_detected,
            });
        } catch (error: any) {
            logger.error('Orchestration error:', error.message);
            throw error;
        }
    },

    async analyzeAndRecommendForMood(
        userId: string,
        moodResult: MoodResult
    ): Promise<AnalyzeMoodResponse> {
        try {
            return analyzeAndRecommendForMood(userId, moodResult);
        } catch (error: any) {
            logger.error('Orchestration error (text):', error.message);
            throw error;
        }
    },
};