import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { orchestrationService } from "../services/orchestration.service";
import { recommendationClient } from "../clients/recommendation.client";
import { uploadRepository } from "../repositories/upload.repository";
import { logger } from "../utils/logger.util";

export const moodController = {
    async analyzeMood(
        request: AuthenticatedRequest,
        reply: FastifyReply
    ) {
        try {
            const data = await request.file();
            if(!data) {
                return reply.status(400).send({ error: 'No file provided' });
            }

            const buffer = await data.toBuffer();
            const userId = request.user!.userId;
            await uploadRepository.create(userId, 'image', buffer, data.mimetype || null);

            const result = await orchestrationService.analyzeMoodAndRecommend({
                imageBuffer: buffer,
                userId,
            });

            return reply.status(200).send(result);
        } catch (error: any) {
            logger.error('Analyze mood error:', error.message);
            throw error;
        }
    },

    async analyzeMoodFromText(
        request: FastifyRequest<{ Body: { text: string } }>,
        reply: FastifyReply
    ) {
        try {
            const authUser = (request as AuthenticatedRequest).user;
            const userId = authUser?.userId ?? 'anonymous';
            const text = request.body?.text ?? '';
            if (userId && userId !== 'anonymous') {
                await uploadRepository.create(userId, 'text', Buffer.from(text, 'utf-8'), 'text/plain');
            }
            const moodResult = await recommendationClient.getEmotionFromText(text);
            const result = await orchestrationService.analyzeAndRecommendForMood(userId, moodResult);
            return reply.status(200).send(result);
        } catch (error: any) {
            logger.error('Analyze mood from text error:', error.message);
            return reply.status(500).send({ error: 'Text mood analysis failed' });
        }
    }
};