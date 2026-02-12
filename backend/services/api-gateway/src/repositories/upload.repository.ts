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

export interface UserUpload {
    id: string;
    user_id: string;
    type: string;
    content: Buffer;
    content_type: string | null;
    created_at: Date;
}

export interface UserUploadListItem {
    id: string;
    user_id: string;
    type: string;
    content_type: string | null;
    created_at: Date;
    text_content?: string;
}

export const uploadRepository = {
    async create(
        userId: string,
        type: 'image' | 'text',
        content: Buffer,
        contentType?: string | null
    ): Promise<UserUpload> {
        const result = await pool.query(
            'INSERT INTO user_uploads (user_id, type, content, content_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, type, content, contentType ?? null]
        );
        return result.rows[0];
    },

    async listByUserId(userId: string, limit = 50): Promise<UserUploadListItem[]> {
        const result = await pool.query(
            'SELECT id, user_id, type, content_type, created_at, content FROM user_uploads WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
            [userId, limit]
        );
        return result.rows.map((row: UserUpload & { content: Buffer }) => ({
            id: row.id,
            user_id: row.user_id,
            type: row.type,
            content_type: row.content_type,
            created_at: row.created_at,
            ...(row.type === 'text' && row.content && { text_content: row.content.toString('utf-8') }),
        }));
    },

    async findByIdAndUserId(id: string, userId: string): Promise<UserUpload | null> {
        const result = await pool.query(
            'SELECT * FROM user_uploads WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rows[0] || null;
    },
};
