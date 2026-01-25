import { email } from "zod";
import { userRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.util";

export const usersService = {
    async getUserById(userId: string) {
        const user = await userRepository.findById(userId);
        if(!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        };
    },
};