import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    preview_url: string | null;
    external_urls: { spotify: string };
}

interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
    };
}

class SpotifyClient {
    private client: AxiosInstance;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.spotify.com/v1',
        });
    }

    private async getAccessToken(): Promise<string> {
        if(this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post<SpotifyToken>(
                'https://accounts.spotify.com/api/token',
                'grant_type=client_credentials',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(
                            `${config.spotify.clientId}:${config.spotify.clientSecret}`
                        ).toString('base64')}`,
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

            return this.accessToken;
        } catch (error: any) {
            logger.error('Spotify token error:', error.message);
            throw new Error('Failed to get Spotify access token');
        }
    }

    async searchTracks(
        query: string,
        limit: number = 20
    ): Promise<SpotifyTrack[]> {
        try {
            const token = await this.getAccessToken();
            const response = await this.client.get<SpotifySearchResponse>(
                '/search',
                {
                    params: {
                        q: query,
                        type: 'track',
                        limit,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.tracks.items;
        } catch (error: any) {
            logger.error('Spotify search error:', error.message);
            throw new Error('Spotify search failed');
        }
    }
    /**
     * Get tracks by searching Spotify by genre(s).
     * Replaces the deprecated Get Recommendations endpoint (returns 404 for new/dev apps).
     * Search limit per request is 10 (Feb 2026); we run multiple searches and merge to reach requested limit.
     */
    async getTracksByGenreSearch(
        genres: string[],
        limit: number = 20
    ): Promise<SpotifyTrack[]> {
        const token = await this.getAccessToken();
        const seenIds = new Set<string>();
        const tracks: SpotifyTrack[] = [];
        const genresToUse = genres.slice(0, 5);
        const perRequestLimit = 10;

        for (const genre of genresToUse) {
            if (tracks.length >= limit) break;
            try {
                const response = await this.client.get<SpotifySearchResponse>(
                    '/search',
                    {
                        params: {
                            q: `genre:${genre}`,
                            type: 'track',
                            limit: perRequestLimit,
                            market: 'US',
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const items = response.data.tracks?.items ?? [];
                for (const track of items) {
                    if (!seenIds.has(track.id)) {
                        seenIds.add(track.id);
                        tracks.push(track);
                        if (tracks.length >= limit) break;
                    }
                }
            } catch (error: any) {
                logger.warn(`Spotify search for genre "${genre}" failed:`, error.message);
            }
        }

        if (tracks.length === 0) {
            throw new Error('Spotify search failed to return any tracks');
        }
        return tracks;
    }
}

export const spotifyClient = new SpotifyClient();