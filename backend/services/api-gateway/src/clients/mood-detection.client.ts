import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

export interface MoodDetectionResponse {
    predicted_emotion: string;
    confidence: number;
    emotion_probabilities: Record<string, number>;
    face_detected: boolean;
    face_info?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

class MoodDetectionClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.services.moodDetection,
            timeout: 10000,
        });
    }

    async detectMood(imageBuffer: Buffer): Promise<MoodDetectionResponse> {
        try {
            const formData = new FormData();
            const blob = new Blob([imageBuffer], { type: 'image/jpeg'});
            formData.append('file', blob, 'image.jpg');

            const response = await this.client.post<MoodDetectionResponse>(
                '/infer/mood',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error('Mood detection client error:', error.message);
            throw new Error(`Mood detection failed: ${error.message}`);
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        } catch {
            return false;
        }
    }
}

export const moodDetectionClient = new MoodDetectionClient();