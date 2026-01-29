import { logger } from '../utils/logger.util';

interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    preview_url: string | null;
    external_urls: { spotify: string };
}

const getYouTubeSearchUrl = (songName: string, artist: string): string => {
    const query = encodeURIComponent(`${songName} ${artist}`);
    return `https://www.youtube.com/results?search_query=${query}`;
};

const curatedPlaylists: Record<string, SpotifyTrack[]> = {
    happy: [
        {
            id: 'fallback-happy-1',
            name: 'Happy',
            artists: [{ name: 'Pharrell Williams' }],
            preview_url: getYouTubeSearchUrl('Happy', 'Pharrell Williams'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-2',
            name: 'Can\'t Stop the Feeling!',
            artists: [{ name: 'Justin Timberlake' }],
            preview_url: getYouTubeSearchUrl('Can\'t Stop the Feeling!', 'Justin Timberlake'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-3',
            name: 'Walking on Sunshine',
            artists: [{ name: 'Katrina & The Waves' }],
            preview_url: getYouTubeSearchUrl('Walking on Sunshine', 'Katrina & The Waves'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-4',
            name: 'Good Vibrations',
            artists: [{ name: 'The Beach Boys' }],
            preview_url: getYouTubeSearchUrl('Good Vibrations', 'The Beach Boys'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-5',
            name: 'Uptown Funk',
            artists: [{ name: 'Bruno Mars' }],
            preview_url: getYouTubeSearchUrl('Uptown Funk', 'Bruno Mars'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-6',
            name: 'Dancing Queen',
            artists: [{ name: 'ABBA' }],
            preview_url: getYouTubeSearchUrl('Dancing Queen', 'ABBA'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-7',
            name: 'I Gotta Feeling',
            artists: [{ name: 'The Black Eyed Peas' }],
            preview_url: getYouTubeSearchUrl('I Gotta Feeling', 'The Black Eyed Peas'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-8',
            name: 'Shake It Off',
            artists: [{ name: 'Taylor Swift' }],
            preview_url: getYouTubeSearchUrl('Shake It Off', 'Taylor Swift'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-9',
            name: 'Best Day of My Life',
            artists: [{ name: 'American Authors' }],
            preview_url: getYouTubeSearchUrl('Best Day of My Life', 'American Authors'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-happy-10',
            name: 'Don\'t Worry Be Happy',
            artists: [{ name: 'Bobby McFerrin' }],
            preview_url: getYouTubeSearchUrl('Don\'t Worry Be Happy', 'Bobby McFerrin'),
            external_urls: { spotify: '' }
        }
    ],
    sad: [
        {
            id: 'fallback-sad-1',
            name: 'Someone Like You',
            artists: [{ name: 'Adele' }],
            preview_url: getYouTubeSearchUrl('Someone Like You', 'Adele'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-2',
            name: 'Fix You',
            artists: [{ name: 'Coldplay' }],
            preview_url: getYouTubeSearchUrl('Fix You', 'Coldplay'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-3',
            name: 'Hurt',
            artists: [{ name: 'Johnny Cash' }],
            preview_url: getYouTubeSearchUrl('Hurt', 'Johnny Cash'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-4',
            name: 'Mad World',
            artists: [{ name: 'Gary Jules' }],
            preview_url: getYouTubeSearchUrl('Mad World', 'Gary Jules'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-5',
            name: 'The Sound of Silence',
            artists: [{ name: 'Simon & Garfunkel' }],
            preview_url: getYouTubeSearchUrl('The Sound of Silence', 'Simon & Garfunkel'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-6',
            name: 'All Too Well',
            artists: [{ name: 'Taylor Swift' }],
            preview_url: getYouTubeSearchUrl('All Too Well', 'Taylor Swift'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-7',
            name: 'Skinny Love',
            artists: [{ name: 'Bon Iver' }],
            preview_url: getYouTubeSearchUrl('Skinny Love', 'Bon Iver'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-8',
            name: 'Say Something',
            artists: [{ name: 'A Great Big World' }],
            preview_url: getYouTubeSearchUrl('Say Something', 'A Great Big World'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-9',
            name: 'Creep',
            artists: [{ name: 'Radiohead' }],
            preview_url: getYouTubeSearchUrl('Creep', 'Radiohead'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-sad-10',
            name: 'Nothing Compares 2 U',
            artists: [{ name: 'Sinead O\'Connor' }],
            preview_url: getYouTubeSearchUrl('Nothing Compares 2 U', 'Sinead O\'Connor'),
            external_urls: { spotify: '' }
        }
    ],
    angry: [
        {
            id: 'fallback-angry-1',
            name: 'Killing In The Name',
            artists: [{ name: 'Rage Against The Machine' }],
            preview_url: getYouTubeSearchUrl('Killing In The Name', 'Rage Against The Machine'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-2',
            name: 'Break Stuff',
            artists: [{ name: 'Limp Bizkit' }],
            preview_url: getYouTubeSearchUrl('Break Stuff', 'Limp Bizkit'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-3',
            name: 'Master of Puppets',
            artists: [{ name: 'Metallica' }],
            preview_url: getYouTubeSearchUrl('Master of Puppets', 'Metallica'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-4',
            name: 'Du Hast',
            artists: [{ name: 'Rammstein' }],
            preview_url: getYouTubeSearchUrl('Du Hast', 'Rammstein'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-5',
            name: 'Bulls on Parade',
            artists: [{ name: 'Rage Against The Machine' }],
            preview_url: getYouTubeSearchUrl('Bulls on Parade', 'Rage Against The Machine'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-6',
            name: 'Given Up',
            artists: [{ name: 'Linkin Park' }],
            preview_url: getYouTubeSearchUrl('Given Up', 'Linkin Park'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-7',
            name: 'Chop Suey!',
            artists: [{ name: 'System of a Down' }],
            preview_url: getYouTubeSearchUrl('Chop Suey!', 'System of a Down'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-8',
            name: 'Bleed It Out',
            artists: [{ name: 'Linkin Park' }],
            preview_url: getYouTubeSearchUrl('Bleed It Out', 'Linkin Park'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-9',
            name: 'Sabotage',
            artists: [{ name: 'Beastie Boys' }],
            preview_url: getYouTubeSearchUrl('Sabotage', 'Beastie Boys'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-angry-10',
            name: 'Bodies',
            artists: [{ name: 'Drowning Pool' }],
            preview_url: getYouTubeSearchUrl('Bodies', 'Drowning Pool'),
            external_urls: { spotify: '' }
        }
    ],
    fear: [
        {
            id: 'fallback-fear-1',
            name: 'Thriller',
            artists: [{ name: 'Michael Jackson' }],
            preview_url: getYouTubeSearchUrl('Thriller', 'Michael Jackson'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-2',
            name: 'The Number of the Beast',
            artists: [{ name: 'Iron Maiden' }],
            preview_url: getYouTubeSearchUrl('The Number of the Beast', 'Iron Maiden'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-3',
            name: 'Black Sabbath',
            artists: [{ name: 'Black Sabbath' }],
            preview_url: getYouTubeSearchUrl('Black Sabbath', 'Black Sabbath'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-4',
            name: 'Enter Sandman',
            artists: [{ name: 'Metallica' }],
            preview_url: getYouTubeSearchUrl('Enter Sandman', 'Metallica'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-5',
            name: 'Tubular Bells',
            artists: [{ name: 'Mike Oldfield' }],
            preview_url: getYouTubeSearchUrl('Tubular Bells', 'Mike Oldfield'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-6',
            name: 'The Exorcist Theme',
            artists: [{ name: 'Mike Oldfield' }],
            preview_url: getYouTubeSearchUrl('The Exorcist Theme', 'Mike Oldfield'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-7',
            name: 'Halloween Theme',
            artists: [{ name: 'John Carpenter' }],
            preview_url: getYouTubeSearchUrl('Halloween Theme', 'John Carpenter'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-8',
            name: 'Clair de Lune',
            artists: [{ name: 'Claude Debussy' }],
            preview_url: getYouTubeSearchUrl('Clair de Lune', 'Claude Debussy'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-9',
            name: 'Lux Aeterna',
            artists: [{ name: 'Clint Mansell' }],
            preview_url: getYouTubeSearchUrl('Lux Aeterna', 'Clint Mansell'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-fear-10',
            name: 'Gloomy Sunday',
            artists: [{ name: 'Billie Holiday' }],
            preview_url: getYouTubeSearchUrl('Gloomy Sunday', 'Billie Holiday'),
            external_urls: { spotify: '' }
        }
    ],
    surprise: [
        {
            id: 'fallback-surprise-1',
            name: 'Bohemian Rhapsody',
            artists: [{ name: 'Queen' }],
            preview_url: getYouTubeSearchUrl('Bohemian Rhapsody', 'Queen'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-2',
            name: 'Somebody That I Used To Know',
            artists: [{ name: 'Gotye' }],
            preview_url: getYouTubeSearchUrl('Somebody That I Used To Know', 'Gotye'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-3',
            name: 'Take On Me',
            artists: [{ name: 'a-ha' }],
            preview_url: getYouTubeSearchUrl('Take On Me', 'a-ha'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-4',
            name: 'Mr. Brightside',
            artists: [{ name: 'The Killers' }],
            preview_url: getYouTubeSearchUrl('Mr. Brightside', 'The Killers'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-5',
            name: 'Sweet Dreams (Are Made of This)',
            artists: [{ name: 'Eurythmics' }],
            preview_url: getYouTubeSearchUrl('Sweet Dreams', 'Eurythmics'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-6',
            name: 'Don\'t Stop Me Now',
            artists: [{ name: 'Queen' }],
            preview_url: getYouTubeSearchUrl('Don\'t Stop Me Now', 'Queen'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-7',
            name: 'I Want It That Way',
            artists: [{ name: 'Backstreet Boys' }],
            preview_url: getYouTubeSearchUrl('I Want It That Way', 'Backstreet Boys'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-8',
            name: 'Toxic',
            artists: [{ name: 'Britney Spears' }],
            preview_url: getYouTubeSearchUrl('Toxic', 'Britney Spears'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-9',
            name: 'Pumped Up Kicks',
            artists: [{ name: 'Foster The People' }],
            preview_url: getYouTubeSearchUrl('Pumped Up Kicks', 'Foster The People'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-surprise-10',
            name: 'Electric Feel',
            artists: [{ name: 'MGMT' }],
            preview_url: getYouTubeSearchUrl('Electric Feel', 'MGMT'),
            external_urls: { spotify: '' }
        }
    ],
    disgust: [
        {
            id: 'fallback-disgust-1',
            name: 'Creep',
            artists: [{ name: 'Radiohead' }],
            preview_url: getYouTubeSearchUrl('Creep', 'Radiohead'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-2',
            name: 'Bitter Sweet Symphony',
            artists: [{ name: 'The Verve' }],
            preview_url: getYouTubeSearchUrl('Bitter Sweet Symphony', 'The Verve'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-3',
            name: 'No Surprises',
            artists: [{ name: 'Radiohead' }],
            preview_url: getYouTubeSearchUrl('No Surprises', 'Radiohead'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-4',
            name: 'Fake Plastic Trees',
            artists: [{ name: 'Radiohead' }],
            preview_url: getYouTubeSearchUrl('Fake Plastic Trees', 'Radiohead'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-5',
            name: 'Paranoid Android',
            artists: [{ name: 'Radiohead' }],
            preview_url: getYouTubeSearchUrl('Paranoid Android', 'Radiohead'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-6',
            name: 'How Soon Is Now?',
            artists: [{ name: 'The Smiths' }],
            preview_url: getYouTubeSearchUrl('How Soon Is Now?', 'The Smiths'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-7',
            name: 'The Less I Know The Better',
            artists: [{ name: 'Tame Impala' }],
            preview_url: getYouTubeSearchUrl('The Less I Know The Better', 'Tame Impala'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-8',
            name: 'Losing My Religion',
            artists: [{ name: 'R.E.M.' }],
            preview_url: getYouTubeSearchUrl('Losing My Religion', 'R.E.M.'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-9',
            name: 'Boulevard of Broken Dreams',
            artists: [{ name: 'Green Day' }],
            preview_url: getYouTubeSearchUrl('Boulevard of Broken Dreams', 'Green Day'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-disgust-10',
            name: 'Zombie',
            artists: [{ name: 'The Cranberries' }],
            preview_url: getYouTubeSearchUrl('Zombie', 'The Cranberries'),
            external_urls: { spotify: '' }
        }
    ],
    neutral: [
        {
            id: 'fallback-neutral-1',
            name: 'Blinding Lights',
            artists: [{ name: 'The Weeknd' }],
            preview_url: getYouTubeSearchUrl('Blinding Lights', 'The Weeknd'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-2',
            name: 'Shape of You',
            artists: [{ name: 'Ed Sheeran' }],
            preview_url: getYouTubeSearchUrl('Shape of You', 'Ed Sheeran'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-3',
            name: 'Watermelon Sugar',
            artists: [{ name: 'Harry Styles' }],
            preview_url: getYouTubeSearchUrl('Watermelon Sugar', 'Harry Styles'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-4',
            name: 'Levitating',
            artists: [{ name: 'Dua Lipa' }],
            preview_url: getYouTubeSearchUrl('Levitating', 'Dua Lipa'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-5',
            name: 'Good 4 U',
            artists: [{ name: 'Olivia Rodrigo' }],
            preview_url: getYouTubeSearchUrl('Good 4 U', 'Olivia Rodrigo'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-6',
            name: 'Stay',
            artists: [{ name: 'The Kid LAROI & Justin Bieber' }],
            preview_url: getYouTubeSearchUrl('Stay', 'The Kid LAROI Justin Bieber'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-7',
            name: 'Heat Waves',
            artists: [{ name: 'Glass Animals' }],
            preview_url: getYouTubeSearchUrl('Heat Waves', 'Glass Animals'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-8',
            name: 'As It Was',
            artists: [{ name: 'Harry Styles' }],
            preview_url: getYouTubeSearchUrl('As It Was', 'Harry Styles'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-9',
            name: 'About Damn Time',
            artists: [{ name: 'Lizzo' }],
            preview_url: getYouTubeSearchUrl('About Damn Time', 'Lizzo'),
            external_urls: { spotify: '' }
        },
        {
            id: 'fallback-neutral-10',
            name: 'Flowers',
            artists: [{ name: 'Miley Cyrus' }],
            preview_url: getYouTubeSearchUrl('Flowers', 'Miley Cyrus'),
            external_urls: { spotify: '' }
        }
    ]
};

export const fallbackProviderService = {
    getRecommendations(emotion: string, limit: number = 20): SpotifyTrack[] {
        const normalizedEmotion = emotion.toLowerCase();
        const playlist = curatedPlaylists[normalizedEmotion] || curatedPlaylists.neutral;
        
        logger.info(`Using fallback provider for emotion: ${normalizedEmotion}`);
        
        return playlist.slice(0, Math.min(limit, playlist.length));
    },

    hasRecommendations(emotion: string): boolean {
        const normalizedEmotion = emotion.toLowerCase();
        return normalizedEmotion in curatedPlaylists || normalizedEmotion === 'neutral';
    }
};