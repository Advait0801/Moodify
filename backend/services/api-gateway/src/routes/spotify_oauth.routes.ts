import { FastifyInstance } from 'fastify';
import { spotifyOauthController } from '../controllers/spotify_oauth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export async function spotifyOauthRoutes(fastify: FastifyInstance) {
    fastify.get('/auth/spotify', {
        preHandler: [
            async (request, reply, done) => {
                const intent = (request as any).query?.intent;
                if (intent === 'connect') {
                    return authMiddleware(request as any, reply);
                }
                done();
            },
        ],
    }, spotifyOauthController.redirectToSpotify);

    fastify.get('/auth/spotify/callback', spotifyOauthController.callback);
}