import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { userRepository } from '../repositories/user.repository';
import { spotifyOauthRepository } from '../repositories/spotify_oauth.repository';
import { jwtUtil, JWTPayload } from '../utils/jwt.util';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export type SpotifyStateIntent = 'login' | 'connect';

export interface SpotifyStatePayload {
    intent: SpotifyStateIntent;
    userId?: string;
    returnTo?: 'app';
    iat: number;
}

export interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
}

export interface SpotifyUserProfile {
    id: string;
    email?: string;
    display_name?: string;
}

export const spotifyOauthService = {
    buildAuthorizeUrl(statePayload: Omit<SpotifyStatePayload, 'iat'>): string {
        const payload: SpotifyStatePayload = {
            ...statePayload,
            iat: Math.floor(Date.now() / 1000),
        };
        const state = jwt.sign(
            payload,
            config.jwt.secret,
            { expiresIn: '600s' }
        );
        const params = new URLSearchParams({
            client_id: config.spotify.clientId,
            response_type: 'code',
            redirect_uri: config.spotify.redirectUri,
            scope: config.spotify.scopes.join(' '),
            state,
        });
        return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    },

    verifyState(state: string): SpotifyStatePayload {
        const payload = jwt.verify(state, config.jwt.secret) as SpotifyStatePayload;
        if (!payload.intent || !['login', 'connect'].includes(payload.intent)) {
            throw new Error('Invalid state');
        }
        if (payload.intent === 'connect' && !payload.userId) {
            throw new Error('Invalid state');
        }
        return payload;
    },

    async exchangeCodeForTokens(code: string): Promise<SpotifyTokenResponse> {
        const response = await axios.post<SpotifyTokenResponse>(
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: config.spotify.redirectUri,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(
                        `${config.spotify.clientId}:${config.spotify.clientSecret}`
                    ).toString('base64')}`,
                },
            }
        );
        return response.data;
    },

    async getProfile(accessToken: string): Promise<SpotifyUserProfile> {
        const response = await axios.get<SpotifyUserProfile>(`${SPOTIFY_API_BASE}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    },

    async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
        const response = await axios.post<SpotifyTokenResponse>(
            SPOTIFY_TOKEN_URL,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(
                        `${config.spotify.clientId}:${config.spotify.clientSecret}`
                    ).toString('base64')}`,
                },
            }
        );
        return response.data;
    },

    async handleCallback(code: string, state: string): Promise<{
        intent: SpotifyStateIntent;
        redirectUrl: string;
        token?: string;
        user?: { id: string; email: string; username: string | null };
    }> {
        const statePayload = this.verifyState(state);
        const tokens = await this.exchangeCodeForTokens(code);
        const profile = await this.getProfile(tokens.access_token);

        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        if (statePayload.intent === 'connect') {
            await spotifyOauthRepository.upsert(
                statePayload.userId!,
                profile.id,
                tokens.access_token,
                tokens.refresh_token || '',
                expiresAt
            );
            await userRepository.updateSpotifyUserId(statePayload.userId!, profile.id);
            if (statePayload.returnTo === 'app') {
                const scheme = config.spotify.appScheme.replace(/:\/?\/?$/, '');
                const redirectUrl = `${scheme}://auth/callback?spotify=connected`;
                return { intent: 'connect', redirectUrl };
            }
            const base = config.spotify.frontendSuccessUrl.replace(/\/$/, '');
            const path = config.spotify.frontendConnectSuccessPath.replace(/^\//, '');
            const redirectUrl = `${base}/${path}?spotify=connected`;
            return { intent: 'connect', redirectUrl };
        }

        if (statePayload.intent === 'login') {
            let user = await userRepository.findBySpotifyUserId(profile.id);
            if (!user && profile.email) {
                user = await userRepository.findByEmail(profile.email);
                if (user) {
                    await userRepository.updateSpotifyUserId(user.id, profile.id);
                }
            }
            if (!user) {
                const email = profile.email || `spotify_${profile.id}@moodify.local`;
                const username = profile.display_name || profile.id;
                const passwordHash = await import('bcrypt').then((b) =>
                    b.default.hash(`spotify_${profile.id}_${Date.now()}`, 10)
                );
                user = await userRepository.createWithSpotify(
                    email,
                    username,
                    passwordHash,
                    profile.id
                );
            }
            await spotifyOauthRepository.upsert(
                user.id,
                profile.id,
                tokens.access_token,
                tokens.refresh_token || '',
                expiresAt
            );
            const payload: JWTPayload = { userId: user.id, email: user.email };
            const token = jwtUtil.sign(payload);
            if (statePayload.returnTo === 'app') {
                const scheme = config.spotify.appScheme.replace(/:\/?\/?$/, '');
                const redirectUrl = `${scheme}://auth/callback?token=${encodeURIComponent(token)}`;
                return { intent: 'login', redirectUrl, token, user: { id: user.id, email: user.email, username: user.username } };
            }
            const base = config.spotify.frontendSuccessUrl.replace(/\/$/, '');
            const path = config.spotify.frontendLoginSuccessPath.replace(/^\//, '');
            const redirectUrl = `${base}/${path}?token=${encodeURIComponent(token)}`;
            return {
                intent: 'login',
                redirectUrl,
                token,
                user: { id: user.id, email: user.email, username: user.username },
            };
        }

        throw new Error('Invalid state');
    },
};