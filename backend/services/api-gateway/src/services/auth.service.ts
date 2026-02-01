import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { jwtUtil, JWTPayload } from '../utils/jwt.util';
import { logger } from '../utils/logger.util';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        username: string | null;
    };
    token: string;
    expiresIn: string;
}

export const authService = {
    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existingByEmail = await userRepository.findByEmail(dto.email);
        if(existingByEmail) {
            throw new Error('User already exists');
        }
        const existingByUsername = await userRepository.findByUsername(dto.username);
        if(existingByUsername) {
            throw new Error('Username already taken');
        }

        const passwordhash = await bcrypt.hash(dto.password, 10);
        const user = await userRepository.create(dto.email, dto.username, passwordhash);
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
        };
        const token = jwtUtil.sign(payload);

        logger.info(`User registered: ${user.email}`);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token,
            expiresIn: '7d',
        };
    },

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await userRepository.findByEmailOrUsername(dto.email);
        if(!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(dto.password, user.password_hash);
        if(!isValid) {
            throw new Error('Invalid credentials');
        }

        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
        };
        const token = jwtUtil.sign(payload);

        logger.info(`User logged in: ${user.email}`);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token,
            expiresIn: '7d',
        };
    },
};