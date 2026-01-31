import OpenAI from "openai";
import { config } from "../config/config";
import { logger } from "../utils/logger.util";

const EMOTION_KEYS = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'] as const;

export interface textToEmotionResult {
    predicted_emotion: string;
    confidence: number;
    emotion_probabilities: Record<string, number>;
}

function parseAndNormalize(jsonStr: string): Record<string, number> | null {
    try {
        let raw = jsonStr.trim();
        const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
        if(codeBlock) raw = codeBlock[1].trim();
        const parsed = JSON.parse(raw);
        const out: Record<string, number> = {};

        for(const key of EMOTION_KEYS) {
            const v = parsed[key];
            out[key] = typeof v === 'number' && v >= 0 ? Math.min(1, v) : 0;
        }

        const sum = Object.values(out).reduce((a, b) => a + b, 0);
        if(sum <= 0) return null;

        const normalized: Record<string, number> = {};
        for(const [k, v] of Object.entries(out)) {
            normalized[k] = v / sum;
        }

        return normalized;
    } catch {
        return null;
    }
}

export const textToEmotionService = {
    async fromText(text: string): Promise<textToEmotionResult> {
        if(!text?.trim()) {
            return {
                predicted_emotion: 'neutral',
                confidence: 1,
                emotion_probabilities: { neutral: 1, happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
            };
        }

        if(!config.openai.apiKey || !config.openai.enabled) {
            logger.warn('OpenAI not configured; returning neutral for text input');
            return {
                predicted_emotion: 'neutral',
                confidence: 0.5,
                emotion_probabilities: { neutral: 1, happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
            };
        }

        const client = new OpenAI({ apiKey: config.openai.apiKey, timeout: config.openai.timeoutMs });
        const systemContent =`You output only valid JSON. No markdown, no explanation. Convert the user's emotional state from their message into a probability distribution over emotions. Output a single JSON object with exactly these keys: happy, sad, angry, fear, surprise, disgust, neutral. Each value is a number between 0 and 1. The values must sum to 1.`;
        const userContent = `Message: "${text.slice(0, 500)}"`;

        try {
            const completion = await client.chat.completions.create({
                model: config.openai.model,
                messages: [
                    { role: 'system', content: systemContent },
                    { role: 'user', content: userContent },
                ],
                max_tokens: 150,
                temperature: 0.3,
            });

            const content = completion.choices[0]?.message?.content?.trim();
            const probs = content ? parseAndNormalize(content) : null;

            if(!probs) {
                return {
                    predicted_emotion: 'neutral',
                    confidence: 0.5,
                    emotion_probabilities: { neutral: 1, happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
                };
            }

            let maxProb = 0;
            let predicted = 'neutral';
            for(const [emotion, p] of Object.entries(probs)) {
                if(p > maxProb) {
                    maxProb = p;
                    predicted = emotion;
                }
            }

            return {
                predicted_emotion: predicted,
                confidence: maxProb,
                emotion_probabilities: probs,
            };
        } catch (error: any) {
            logger.warn(`Text-to-emotion failed: ${error.message}`);
            return {
                predicted_emotion: 'neutral',
                confidence: 0.5,
                emotion_probabilities: { neutral: 1, happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
            };
        }
    },
};