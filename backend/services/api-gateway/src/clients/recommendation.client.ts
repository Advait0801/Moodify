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
}

export const recommendationClient = new RecommendationClient();