import { analyticsRepository } from "../repositories/analytics.repository";
import { logger } from "../utils/logger.util";

export interface MoodHistoryData {
    userId: string;
    emotion: string;
    confidence: number;
}

export const analyticsService = {
    async logHistoryMood(data: MoodHistoryData): Promise<void> {
        try {
            await analyticsRepository.createMoodHistory(
                data.userId,
                data.emotion,
                data.confidence
            );
            logger.info(
                `Mood history logged: user=${data.userId}, ` + 
                `emotion=${data.emotion}, confidence=${data.confidence}`
            );
        } catch (error: any) {
            logger.error('Analytics service error:', error.message);
            throw error;
        }
    }
}