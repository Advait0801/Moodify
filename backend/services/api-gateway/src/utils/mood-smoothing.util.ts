export function averageEmotionProbabilities(
    items: Array<{ emotion_probabilities: Record<string, number> }>
): Record<string, number> {
    if(items.length === 0) return {};

    const sum: Record<string, number> = {};
    for(const item of items) {
        for(const [emotion, p] of Object.entries(item.emotion_probabilities)) {
            sum[emotion] = (sum[emotion] ?? 0) + p;
        }
    }

    const n = items.length;
    const averaged: Record<string, number> = {};
    for(const [emotion, s] of Object.entries(sum)) {
        averaged[emotion] = s / n;
    }

    const total = Object.values(averaged).reduce((a, b) => a + b, 0);
    if(total <= 0) return averaged;

    const normalized: Record<string, number> = {};
    for(const [emotion, v] of Object.entries(averaged)) {
        normalized[emotion] = v / total;
    }

    return normalized;
}