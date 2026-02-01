import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middleware/auth.middleware";
import { usersController } from "../controllers/users.controller";

export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/users/me', {
        preHandler: [authMiddleware],
    }, usersController.getProfile);
    fastify.patch('/users/me', {
        preHandler: [authMiddleware],
    }, usersController.updateProfile);
    fastify.post('/users/me/password', {
        preHandler: [authMiddleware],
    }, usersController.changePassword);
}