import Redis from 'ioredis';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

const KEY_PREFIX = 'mood_smooth:';
const TTL_SEC = 60 * 60 * 24;

export interface StoredMood {
    emotion_probabilities: Record<string, number>;
    at: number;
}

class RedisClient {
    private client: Redis | null = null;

    connect(): Redis {
        if(this.client) return this.client;

        this.client = new Redis(config.redis.url);
        this.client.on('error', (err) => logger.warn('Redis error:', err.message));
        return this.client;
    }

    async getRecentMoods(userId: string, limit: number): Promise<StoredMood[]> {
        const redis = this.connect();
        const key = `${KEY_PREFIX}${userId}`;
        const raw = await redis.lrange(key, -limit, -1);
        const out: StoredMood[] = [];

        for(const s of raw) {
            try {
                out.push(JSON.parse(s));
            } catch {
                
            }
        }

        return out;
    }

    async pushMood(userId: string, emotionProbabilities: Record<string, number>, windowSize: number): Promise<void> {
        const redis = this.connect();
        const key = `${KEY_PREFIX}${userId}`;
        const value: StoredMood = {
            emotion_probabilities: { ...emotionProbabilities },
            at: Date.now(),
        };

        await redis.lpush(key, JSON.stringify(value));
        await redis.ltrim(key, 0, windowSize - 1);
        await redis.expire(key, TTL_SEC);
    }

    async disconnect(): Promise<void> {
        if(this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}

export const redisClient = new RedisClient();