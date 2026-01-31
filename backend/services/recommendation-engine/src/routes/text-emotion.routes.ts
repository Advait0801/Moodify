import { FastifyInstance } from "fastify";
import { textEmotionController } from "../controllers/text-emotion.controller";

export async function textEmotionRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: { text: string } }>('/emotions/from-text', {
        schema: {
            body: {
                type: 'object',
                required: ['text'],
                properties: { text: { type: 'string' } },
            },
        },
    }, textEmotionController.fromText);
}