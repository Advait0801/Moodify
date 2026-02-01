import axios from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger.util';

class YouTubeClient {
    async searchVideoId(songName: string, artist: string): Promise<string | null> {
        const apiKey = config.youtube?.apiKey;
        if (!apiKey) return null;
        try {
            const query = `${songName} ${artist}`;
            const response = await axios.get(
                'https://www.googleapis.com/youtube/v3/search',
                {
                    params: {
                        part: 'snippet',
                        q: query,
                        type: 'video',
                        maxResults: 1,
                        key: apiKey,
                    },
                }
            );
            return response.data?.items?.[0]?.id?.videoId ?? null;
        } catch (err: any) {
            logger.warn(`YouTube search failed for "${songName} ${artist}":`, err.message);
            return null;
        }
    }
}

export const youtubeClient = new YouTubeClient();
