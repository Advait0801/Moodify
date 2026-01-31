import { openAIClient } from "../clients/openai.client";
import { config } from "../config/config";
import { logger } from "../utils/logger.util";

export interface ExplanationInput {
    primaryEmotion: string;
    valence: number;
    energy: number;
    tracks: Array<{ name: string; artist: string }>;
}

export const explanationService = {
    async getExplanation(input: ExplanationInput): Promise<string | null> {
        if(!config.openai.apiKey || !config.openai.enabled) {
            logger.warn('Explanation skipped: OpenAI not configured or disabled');
            return null;
        }

        const trackList = input.tracks
            .slice(0, 10)
            .map((t) => `${t.name} by ${t.artist}`)
            .join(', ');

        const userContent = [
            `Detected mood: ${input.primaryEmotion}`,
            `Music parameters: energy ${input.energy.toFixed(2)}, valence ${input.valence.toFixed(2)} (valence = positivity of mood).`,
            `Tracks picked: ${trackList}.`,
            `Write 1-2 short, friendly sentences explaining why these songs were chosen for this mood. No bullet points or markdown.`,
        ].join(' ');

        const messages = [
            {
                role: 'system' as const,
                content: 'You explain music recommendations in 1–2 brief, natural sentences. Be warm and concise.',
            },
            { role: 'user' as const, content: userContent },
        ];

        return openAIClient.createChatCompletion(messages);
    },
};