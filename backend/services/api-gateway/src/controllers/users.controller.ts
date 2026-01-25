import { FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { usersService } from "../services/users.service";

export const usersController = {
    async getProfile(
        request: AuthenticatedRequest,
        reply: FastifyReply
    ) {
        try {
            const user = await usersService.getUserById(request.user!.userId);
            return reply.status(200).send(user);
        } catch (error: any) {
            throw error;
        }
    }
}