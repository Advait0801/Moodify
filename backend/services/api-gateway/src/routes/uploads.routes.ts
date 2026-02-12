import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadsController } from "../controllers/uploads.controller";

export async function uploadsRoutes(fastify: FastifyInstance) {
    fastify.get('/users/me/uploads', {
        preHandler: [authMiddleware],
    }, uploadsController.listMine);

    fastify.get<{ Params: { id: string } }>('/uploads/:id', {
        preHandler: [authMiddleware],
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id'],
            },
        },
    }, uploadsController.getById);
}
