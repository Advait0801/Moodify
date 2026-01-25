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
    async getRecommendations(
        seedGenres: string[],
        targetEnergy: number,
        targetValence: number,
        targetDanceability: number,
        limit: number = 20
    ): Promise<SpotifyTrack[]> {
        try {
            const token = await this.getAccessToken();
            const response = await this.client.get<{ tracks: SpotifyTrack[] }>(
                '/recommendations',
                {
                    params: {
                        seed_genres: seedGenres.slice(0, 5).join(','),
                        target_energy: targetEnergy,
                        target_valence: targetValence,
                        target_danceability: targetDanceability,
                        limit,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.tracks;
        } catch (error: any) {
            logger.error('Spotify recommendations error:', error.message);
            throw new Error('Spotify recommendations failed');
        }
    }
}

export const spotifyClient = new SpotifyClient();