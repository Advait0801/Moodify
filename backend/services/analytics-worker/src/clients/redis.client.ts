import Redis from "ioredis";
import { config } from "../config/config";
import { logger } from "../utils/logger.util";

export class RedisClient {
    private client: Redis;

    constructor() {
        this.client = new Redis(config.redis.url, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            logger.info('Redis connected');
        });

        this.client.on('error', (err) => {
            logger.error('Redis error:', err.message);
        });
    }

    async popFromQueue(): Promise<string | null> {
        return await this.client.brpop(
            config.redis.queueName,
            5
        ).then((result) => result ? result[1] : null);
    }

    async pushToQueue(data: string): Promise<void> {
        await this.client.lpush(config.redis.queueName, data);
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export const redisClient = new RedisClient();