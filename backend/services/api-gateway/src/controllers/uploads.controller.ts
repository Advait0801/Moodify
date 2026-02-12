import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { uploadRepository } from "../repositories/upload.repository";

export const uploadsController = {
    async listMine(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const userId = request.user!.userId;
            const limit = Math.min(Number((request.query as { limit?: string }).limit) || 50, 100);
            const items = await uploadRepository.listByUserId(userId, limit);
            return reply.status(200).send({ uploads: items });
        } catch (error: any) {
            throw error;
        }
    },

    async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const authReq = request as AuthenticatedRequest;
            const userId = authReq.user!.userId;
            const { id } = request.params;
            const upload = await uploadRepository.findByIdAndUserId(id, userId);
            if (!upload) {
                return reply.status(404).send({ error: 'Upload not found' });
            }
            if (upload.type === 'image') {
                reply.header('Content-Type', upload.content_type || 'image/jpeg');
                return reply.status(200).send(upload.content);
            }
            reply.header('Content-Type', 'application/json');
            return reply.status(200).send({
                type: 'text',
                text_content: upload.content.toString('utf-8'),
            });
        } catch (error: any) {
            throw error;
        }
    },
};
