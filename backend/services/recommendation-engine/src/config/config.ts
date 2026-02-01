import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',

    database: {
        url: process.env.DATABASE_URL || 'postgresql://moodify:moodify_dev@localhost:5432/moodify',
    },

    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
        redirectUri: process.env.SPOTIFY_REDIRECT_URI || '',
    },

    confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.4'),

    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_EXPLANATION_MODEL || 'gpt-4o-mini',
        enabled: process.env.OPENAI_EXPLANATION_ENABLED !== 'false',
        timeoutMs: parseInt(process.env.OPENAI_EXPLANATION_TIMEOUT_MS || '5000', 10),
    },

    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY || '',
    },
};