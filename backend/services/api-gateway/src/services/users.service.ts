import bcrypt from 'bcrypt';
import { userRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.util";

const MAX_PROFILE_PICTURE_LENGTH = 600000;

export const usersService = {
    async getUserById(userId: string) {
        const user = await userRepository.findById(userId);
        if(!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            username: user.username ?? null,
            profilePicture: user.profile_picture ?? null,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    },

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await userRepository.findById(userId);
        if(!user) {
            throw new Error('User not found');
        }
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if(!valid) {
            throw new Error('Current password is incorrect');
        }
        const hash = await bcrypt.hash(newPassword, 10);
        await userRepository.updatePassword(userId, hash);
        logger.info(`Password changed for user ${userId}`);
    },

    async updateProfilePicture(userId: string, profilePicture: string | null) {
        if(profilePicture !== null && profilePicture.length > MAX_PROFILE_PICTURE_LENGTH) {
            throw new Error('Profile picture is too large');
        }
        await userRepository.updateProfilePicture(userId, profilePicture);
        logger.info(`Profile picture updated for user ${userId}`);
    },
};