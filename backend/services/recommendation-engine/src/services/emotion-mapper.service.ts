export interface EmotionMapping {
    genres: string[];
    energy: number;
    valence: number;
    danceability: number;
}

// Only use Spotify accepted genre seeds (see GET /recommendations/available-genre-seeds).
// Avoid "happy", "sad", "dark", "soundtrack" etc. which can cause 404.
export const emotionMapper = {
    happy: {
        genres: ['pop', 'dance', 'electronic'],
        energy: 0.8,
        valence: 0.9,
        danceability: 0.8,
    },
    sad: {
        genres: ['acoustic', 'indie', 'blues', 'singer-songwriter'],
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
        genres: ['ambient', 'electronic', 'soundtracks', 'classical'],
        energy: 0.4,
        valence: 0.3,
        danceability: 0.3,
    },
    surprise: {
        genres: ['pop', 'electronic', 'indie', 'alt-rock'],
        energy: 0.7,
        valence: 0.7,
        danceability: 0.7,
    },
    disgust: {
        genres: ['alternative', 'indie', 'rock', 'punk'],
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

function blendFromProbabilities(
    probabilities: Record<string, number>
): EmotionMapping {
    const knownEmotion = Object.keys(emotionMapper);
    let valenceSum = 0;
    let energySum = 0;
    let danceabilitySum = 0;

    for(const emotion of knownEmotion) {
        const prob = probabilities[emotion] ?? 0;
        if(prob <= 0) continue;

        const m = emotionMapper[emotion];
        if(!m) continue;

        valenceSum += prob * m.valence;
        energySum += prob * m.energy;
        danceabilitySum += prob * m.danceability;
    }

    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    const primary = (Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0]?.[0]?.toLowerCase()) || 'neutral';
    const mapping = emotionMapper[primary] || emotionMapper.neutral;

    if(valenceSum === 0 && energySum === 0 && danceabilitySum === 0) {
        return emotionMapper.neutral;
    }

    return {
        genres: mapping.genres,
        valence: clamp(valenceSum),
        energy: clamp(energySum),
        danceability: clamp(danceabilitySum),
    };
}

export const emotionMapperService = {
    getMapping(emotion: string): EmotionMapping {
        return emotionMapper[emotion.toLowerCase()] || emotionMapper.neutral;
    },
    blendFromProbabilities,
};