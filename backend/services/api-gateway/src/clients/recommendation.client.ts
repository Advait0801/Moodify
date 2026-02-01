import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

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
        youtube_video_id?: string;
    }>;
    emotion: string;
    explanation?: string;
}

class RecommendationClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.services.recommendation,
            timeout: 15000,
        });
    }

    async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
        try {
            const response = await this.client.post<RecommendationResponse>(
                '/recommendations',
                request
            );
            
            return response.data;
        } catch (error: any) {
            logger.error('Recommendation client error:', error.message);
            throw new Error(`Recommendation failed: ${error.message}`);
        }
    }

    async getEmotionFromText(text: string): Promise<{
        predicted_emotion: string;
        confidence: number;
        emotion_probabilities: Record<string, number>;
    }> {
        try {
            const response = await this.client.post(
                '/emotions/from-text',
                { text }
            );

            return response.data;
        } catch (error: any) {
            logger.error('Recommendation client getEmotionFromText error:', error.message);
            throw new Error('Text emotion analysis failed');
        }
    }
}

export const recommendationClient = new RecommendationClient();