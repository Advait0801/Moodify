import { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../utils/logger.util";

export const errorHandler = (
    error: Error,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    logger.error('Error:', error.message);

    if(error.message === 'User already exists') {
        return reply.status(409).send({ error: error.message });
    }

    if(error.message === 'Invalid credentials' || error.message === 'Invalid token') {
        return reply.status(401).send({ error: error.message });
    } 

    if(error.message === 'User not found') {
        return reply.status(404).send({ error: error.message });
    }
      
    return reply.status(500).send({ error: 'Internal server error' });
};