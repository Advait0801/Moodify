import { Pool } from "pg";
import { config } from "../config/config";

let connectionString = config.database.url ?? "";
const isRds = connectionString.includes("rds.amazonaws.com") || connectionString.includes("sslmode=require");
if (isRds) {
    connectionString = connectionString
        .replace(/\?sslmode=[^&]*/g, "?")
        .replace(/&sslmode=[^&]*/g, "")
        .replace(/\?&/g, "?")
        .replace(/\?$/, "");
}

const pool = new Pool({
    connectionString,
    ...(isRds && { ssl: { rejectUnauthorized: false } }),
});

export interface RecommendationRecord {
    id: string;
    user_id: string;
    emotion: string;
    spotify_playlist_id: string | null;
    spotify_track_ids: string[];
    created_at: Date;
}

export const recommendationRepository = {
    async create(
        userId: string,
        emotion: string,
        trackIds: string[],
        playlistId?: string
    ): Promise<RecommendationRecord> {
        const result = await pool.query(
            `INSERT INTO recommendations (user_id, emotion, spotify_playlist_id, spotify_track_ids, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *`,
            [userId, emotion, playlistId || null, JSON.stringify(trackIds)]
        );
        return result.rows[0];
    },
};