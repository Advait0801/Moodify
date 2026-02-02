import { Pool } from 'pg';
import { config } from '../config/config';

let connectionString = config.database.url ?? '';
const isRds = connectionString.includes('rds.amazonaws.com') || connectionString.includes('sslmode=require');
if (isRds) {
    connectionString = connectionString
        .replace(/\?sslmode=[^&]*/g, '?')
        .replace(/&sslmode=[^&]*/g, '')
        .replace(/\?&/g, '?')
        .replace(/\?$/, '');
}

const pool = new Pool({
    connectionString,
    ...(isRds && { ssl: { rejectUnauthorized: false } }),
});

export interface User {
    id: string;
    email: string;
    username: string | null;
    password_hash: string;
    profile_picture: string | null;
    created_at: Date;
    updated_at: Date;
}

export const userRepository = {
    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    },

    async findByUsername(username: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0] || null;
    },

    async findByEmailOrUsername(login: string): Promise<User | null> {
        if (login.includes('@')) {
            return this.findByEmail(login);
        }
        return this.findByUsername(login);
    },

    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create(email: string, username: string, passwordHash: string): Promise<User> {
        const result = await pool.query(
            'INSERT INTO users (email, username, password_hash, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
            [email, username, passwordHash]
        );
        return result.rows[0];
    },

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [passwordHash, userId]
        );
    },

    async updateProfilePicture(userId: string, profilePicture: string | null): Promise<void> {
        await pool.query(
            'UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2',
            [profilePicture, userId]
        );
    },
};