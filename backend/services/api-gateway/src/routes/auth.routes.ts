import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/register', authController.register);
    fastify.post('/auth/login', authController.login);
}