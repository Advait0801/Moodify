import { FastifyRequest, FastifyReply } from "fastify";
import { authService, LoginDto, RegisterDto } from "../services/auth.service";
import { logger } from "../utils/logger.util";

export const authController = {
    async register(
        request: FastifyRequest<{ Body: RegisterDto }>,
        reply: FastifyReply
    ) {
        try {
            const result = await authService.register(request.body);
            return reply.status(201).send(result);
        } catch (error: any) {
            logger.error('Register error:', error.message);
            throw error;
        }
    },

    async login(
        request: FastifyRequest<{ Body: LoginDto }>,
        reply: FastifyReply
    ) {
        try {
            const result = await authService.login(request.body);
            return reply.status(200).send(result);
        } catch (error: any) {
            logger.error('Login error:', error.message);
            throw error;
        }
    },
};