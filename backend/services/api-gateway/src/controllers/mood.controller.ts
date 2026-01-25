import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { orchestrationService } from "../services/orchestration.service";
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
};