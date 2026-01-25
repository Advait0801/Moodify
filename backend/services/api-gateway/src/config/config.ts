import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',

    database: {
        url: process.env.DATABASE_URL || 'postgresql://moodify:moodify_dev@localhost:5432/moodify',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'advait0801',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    services: {
        moodDetection: process.env.MOOD_DETECTION_SERVICE_URL || 'http://localhost:8001',
        recommendation: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3001',
    },
};