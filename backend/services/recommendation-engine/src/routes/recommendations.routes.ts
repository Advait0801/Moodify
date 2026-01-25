import { FastifyInstance } from "fastify";
import { recommendationController } from "../controllers/recommendations.controller";

export async function recommendationsRoutes(fastify: FastifyInstance) {
    fastify.post('/recommendations', recommendationController.getRecommendations);
}