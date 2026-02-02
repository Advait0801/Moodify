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

export interface MoodHistoryRecord {
    id: string;
    user_id: string;
    emotion: string;
    confidence: number;
    created_at: Date;
}

export const analyticsRepository = {
    async createMoodHistory(
        userId: string,
        emotion: string,
        confidence: number
    ): Promise<MoodHistoryRecord> {
        const result = await pool.query(
            `INSERT INTO mood_history (user_id, emotion, confidence, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *`,
            [userId, emotion, confidence]
        );
        return result.rows[0];
    },
};