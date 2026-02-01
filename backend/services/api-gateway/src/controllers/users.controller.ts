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
    },

    async updateProfile(
        request: AuthenticatedRequest,
        reply: FastifyReply
    ) {
        try {
            const body = request.body as { profilePicture?: string | null } | undefined;
            const profilePicture = body?.profilePicture;
            if (profilePicture !== undefined) {
                await usersService.updateProfilePicture(request.user!.userId, profilePicture ?? null);
            }
            const user = await usersService.getUserById(request.user!.userId);
            return reply.status(200).send(user);
        } catch (error: any) {
            throw error;
        }
    },

    async changePassword(
        request: AuthenticatedRequest,
        reply: FastifyReply
    ) {
        try {
            const body = request.body as { currentPassword?: string; newPassword?: string } | undefined;
            const { currentPassword, newPassword } = body ?? {};
            if (!currentPassword || !newPassword) {
                return reply.status(400).send({ error: 'Current password and new password are required' });
            }
            if (newPassword.length < 6) {
                return reply.status(400).send({ error: 'New password must be at least 6 characters' });
            }
            await usersService.changePassword(request.user!.userId, currentPassword, newPassword);
            return reply.status(200).send({ success: true });
        } catch (error: any) {
            throw error;
        }
    },
}