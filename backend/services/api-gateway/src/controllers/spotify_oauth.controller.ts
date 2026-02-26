import { FastifyRequest, FastifyReply } from 'fastify';
import { spotifyOauthService, SpotifyStateIntent } from '../services/spotify_oauth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

export const spotifyOauthController = {
    async redirectToSpotify(request: FastifyRequest, reply: FastifyReply) {
        try {
            const query = request.query as { intent?: string; returnTo?: string };
            const intent = (query.intent || 'login') as SpotifyStateIntent;
            if (intent !== 'login' && intent !== 'connect') {
                return reply.status(400).send({ error: 'Invalid intent' });
            }

            if (intent === 'connect') {
                const authReq = request as AuthenticatedRequest;
                if (!authReq.user?.userId) {
                    return reply.status(401).send({ error: 'Unauthorized' });
                }
            const url = spotifyOauthService.buildAuthorizeUrl({
                intent: 'connect',
                userId: authReq.user.userId,
            });
                return reply.status(302).redirect(url);
            }

            const returnTo = query.returnTo;
            const url = spotifyOauthService.buildAuthorizeUrl({
                intent: 'login',
                ...(returnTo === 'app' && { returnTo: 'app' as const }),
            });
            return reply.status(302).redirect(url);
        } catch (error: any) {
            logger.error('Spotify redirect error:', error.message);
            throw error;
        }
    },

    async getConnectUrl(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = (request as AuthenticatedRequest).user?.userId;
            if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
            const query = request.query as { returnTo?: string };
            const returnTo = query.returnTo;
            const url = spotifyOauthService.buildAuthorizeUrl({
                intent: 'connect',
                userId,
                ...(returnTo === 'app' && { returnTo: 'app' as const }),
            });
            return reply.status(200).send({ url });
        } catch (error: any) {
            logger.error('Spotify connect URL error:', error.message);
            throw error;
        }
    },

    async callback(request: FastifyRequest, reply: FastifyReply) {
        try {
            const query = request.query as { code?: string; state?: string; error?: string };
            if (query.error) {
                logger.warn('Spotify OAuth error from provider:', query.error);
                const base = config.spotify.frontendSuccessUrl.replace(/\/$/, '');
                return reply.status(302).redirect(`${base}/?spotify=error`);
            }
            const code = query.code;
            const state = query.state;
            if (!code || !state) {
                return reply.status(400).send({ error: 'Missing code or state' });
            }
            const result = await spotifyOauthService.handleCallback(code, state);
            return reply.status(302).redirect(result.redirectUrl);
        } catch (error: any) {
            logger.error('Spotify callback error:', error.message);
            throw error;
        }
    },
};