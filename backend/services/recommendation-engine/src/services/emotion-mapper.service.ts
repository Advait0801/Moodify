export interface EmotionMapping {
    genres: string[];
    energy: number;
    valence: number;
    danceability: number;
}

export const emotionMapper = {
    happy: {
        genres: ['pop', 'dance', 'electronic', 'happy'],
        energy: 0.8,
        valence: 0.9,
        danceability: 0.8,
    },
    sad: {
        genres: ['sad', 'acoustic', 'indie', 'blues'],
        energy: 0.3,
        valence: 0.2,
        danceability: 0.3,
    },
    angry: {
        genres: ['rock', 'metal', 'punk', 'hard-rock'],
        energy: 0.9,
        valence: 0.3,
        danceability: 0.5,
    },
    fear: {
        genres: ['ambient', 'dark', 'electronic', 'soundtrack'],
        energy: 0.4,
        valence: 0.3,
        danceability: 0.3,
    },
    surprise: {
        genres: ['pop', 'electronic', 'indie-pop'],
        energy: 0.7,
        valence: 0.7,
        danceability: 0.7,
    },
    disgust: {
        genres: ['alternative', 'indie', 'experimental'],
        energy: 0.5,
        valence: 0.4,
        danceability: 0.4,
    },
    neutral: {
        genres: ['pop', 'indie', 'acoustic'],
        energy: 0.5,
        valence: 0.5,
        danceability: 0.5,
    },
} as Record<string, EmotionMapping>;

export const emotionMapperService = {
    getMapping(emotion: string): EmotionMapping {
        return emotionMapper[emotion.toLowerCase()] || emotionMapper.neutral;
    },
};