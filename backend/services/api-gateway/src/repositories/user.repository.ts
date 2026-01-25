import { Pool } from 'pg';
import { config } from '../config/config';

const pool = new Pool({
    connectionString: config.database.url,
});

export interface User {
    id: string;
    email: string;
    password_hash: string;
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

    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create(email: string, passwordHash: string): Promise<User> {
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
            [email, passwordHash]
        );
        return result.rows[0];
    },
};