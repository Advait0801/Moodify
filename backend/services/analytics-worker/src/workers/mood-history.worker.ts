import { redisClient } from "../clients/redis.client";
import { analyticsService, MoodHistoryData } from "../services/analytics.service";
import { logger } from "../utils/logger.util";

export class MoodHistoryWorker {
    private isRunning: boolean = false;

    async start(): Promise<void> {
        this.isRunning = true;
        logger.info('Mood History Worker started');

        while(this.isRunning) {
            try {
                const jobData = await redisClient.popFromQueue();
                if(jobData) {
                    await this.processJob(jobData);
                }
            } catch (error: any) {
                logger.error('Worker error:', error.message);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    }

    private async processJob(jobData: string): Promise<void> {
        try {
            const data: MoodHistoryData = JSON.parse(jobData);
            if(!data.userId || !data.emotion || data.confidence === undefined) {
                logger.warn('Invalid job data:', jobData);
                return;
            }

            await analyticsService.logHistoryMood(data);
        } catch (error: any) {
            logger.error('Job processing error:', error.message);
        }
    }

    async stop(): Promise<void> {
        this.isRunning = false;
        logger.info('Mood History Worker stopped');
        await redisClient.disconnect();
    }
}