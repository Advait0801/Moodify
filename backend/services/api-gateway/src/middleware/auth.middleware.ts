import { FastifyRequest, FastifyReply } from "fastify";
import { jwtUtil } from "../utils/jwt.util";
import { error } from "node:console";

export interface AuthenticatedRequest extends FastifyRequest {
    user?: {
        userId: string;
        email: string;
    };
}

export const authMiddleware = async (
    request: AuthenticatedRequest,
    reply: FastifyReply
) => {
    try {
        const authHeader = request.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const payload = jwtUtil.verify(token);

        request.user = {
            userId: payload.userId,
            email: payload.email,
        };
    } catch (error) {
        return reply.status(401).send({ error: 'Invalid token' });
    }
};