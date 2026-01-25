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
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
    token: string;
    expiresIn: string;
}

export const authService = {
    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await userRepository.findByEmail(dto.email);
        if(existingUser) {
            throw new Error('User already exists');
        }

        const passwordhash = await bcrypt.hash(dto.password, 10);
        const user = await userRepository.create(dto.email, passwordhash);
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
            },
            token,
            expiresIn: '7d',
        };
    },

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await userRepository.findByEmail(dto.email);
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
            },
            token,
            expiresIn: '7d',
        };
    },
};