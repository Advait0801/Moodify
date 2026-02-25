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

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    
    moodSmoothing: {
        windowSize: parseInt(process.env.MOOD_SMOOTHING_WINDOW_SIZE || '3', 10),
    },

    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
        redirectUri: process.env.SPOTIFY_REDIRECT_URI || '',
        scopes: (process.env.SPOTIFY_SCOPES || 'user-read-email user-read-private playlist-modify-public playlist-modify-private').split(' '),
        frontendSuccessUrl: process.env.FRONTEND_SUCCESS_URL || 'http://localhost:3002',
        frontendLoginSuccessPath: process.env.FRONTEND_LOGIN_SUCCESS_PATH || '/auth/callback',
        frontendConnectSuccessPath: process.env.FRONTEND_CONNECT_SUCCESS_PATH || '/dashboard',
    },
};