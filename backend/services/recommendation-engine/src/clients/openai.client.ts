import OpenAI from 'openai';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

class OpenAIClient {
    private client: OpenAI | null = null;

    private getClient(): OpenAI | null {
        if(!config.openai.apiKey || !config.openai.enabled) return null;

        if(!this.client) {
            this.client = new OpenAI({
                apiKey: config.openai.apiKey,
                timeout: config.openai.timeoutMs,
            });
        }
        return this.client;
    }

    async createChatCompletion(messages: ChatMessage[]): Promise<string | null> {
        const client = this.getClient();
        if(!client) return null;

        try {
            const completion = await client.chat.completions.create({
                model: config.openai.model,
                messages: messages as OpenAI.ChatCompletionMessageParam[],
                max_tokens: 150,
                temperature: 0.7,
            });
            const content = completion.choices?.[0]?.message?.content?.trim();


            return content ?? null;
        } catch (error: any) {
            logger.warn(`OpenAI explanation failed: ${error.message}`);
            return null;
        }
    }
}

export const openAIClient = new OpenAIClient();