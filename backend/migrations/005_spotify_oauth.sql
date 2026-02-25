ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_user_id VARCHAR(255) UNIQUE;

CREATE TABLE IF NOT EXISTS spotify_tokens (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    spotify_user_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spotify_tokens_spotify_user_id ON spotify_tokens(spotify_user_id);