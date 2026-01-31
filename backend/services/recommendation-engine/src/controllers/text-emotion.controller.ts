import { FastifyRequest, FastifyReply } from "fastify";
import { textToEmotionService } from "../services/text-to-emotion.service";

interface TextBody {
    text: string;
}

export const textEmotionController = {
    async fromText(
        request: FastifyRequest<{ Body: TextBody }>,
        reply: FastifyReply
    ) {
        try {
            const { text } = request.body ?? {};
            const result = await textToEmotionService.fromText(text ?? '');
            
            return reply.status(200).send(result);            
        } catch (error: any) {
            request.log?.error?.(error);
            return reply.status(500).send({ error: 'Text emotion analysis failed' });
        }
    },
};