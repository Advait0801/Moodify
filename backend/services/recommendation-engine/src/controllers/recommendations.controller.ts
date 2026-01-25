import { FastifyRequest, FastifyReply } from "fastify";
import { recommendationService, RecommendationRequest } from "../services/recommendation.service";
import { logger } from "../utils/logger.util";

export const recommendationController = {
    async getRecommendations(
        request: FastifyRequest<{ Body: RecommendationRequest }>,
        reply: FastifyReply
    ) {
        try {
            const result = await recommendationService.getRecommendations(request.body);
            return reply.status(200).send(result);
        } catch (error: any) {
            logger.error('Recommendations controller error:', error.message);
        }
    },
};