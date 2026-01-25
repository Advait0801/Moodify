import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { moodController } from "../controllers/mood.controller";

export async function moodRoutes(fastify: FastifyInstance) {
    fastify.post('/mood/analyze', {
        preHandler: [authMiddleware],
    }, moodController.analyzeMood);
}