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

export interface SpotifyTokenRow {
    user_id: string;
    spotify_user_id: string;
    access_token: string;
    refresh_token: string;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

export const spotifyOauthRepository = {
    async findByUserId(userId: string): Promise<SpotifyTokenRow | null> {
        const result = await pool.query<SpotifyTokenRow>(
            'SELECT * FROM spotify_tokens WHERE user_id = $1',
            [userId]
        );
        return result.rows[0] || null;
    },

    async findBySpotifyUserId(spotifyUserId: string): Promise<SpotifyTokenRow | null> {
        const result = await pool.query<SpotifyTokenRow>(
            'SELECT * FROM spotify_tokens WHERE spotify_user_id = $1',
            [spotifyUserId]
        );
        return result.rows[0] || null;
    },

    async upsert(
        userId: string,
        spotifyUserId: string,
        accessToken: string,
        refreshToken: string,
        expiresAt: Date
    ): Promise<void> {
        await pool.query(
            `INSERT INTO spotify_tokens (user_id, spotify_user_id, access_token, refresh_token, expires_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               spotify_user_id = EXCLUDED.spotify_user_id,
               access_token = EXCLUDED.access_token,
               refresh_token = EXCLUDED.refresh_token,
               expires_at = EXCLUDED.expires_at,
               updated_at = NOW()`,
            [userId, spotifyUserId, accessToken, refreshToken, expiresAt]
        );
    },

    async deleteByUserId(userId: string): Promise<void> {
        await pool.query('DELETE FROM spotify_tokens WHERE user_id = $1', [userId]);
    },
};