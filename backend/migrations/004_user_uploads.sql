CREATE TABLE IF NOT EXISTS user_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    content BYTEA NOT NULL,
    content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_uploads_user_id ON user_uploads(user_id);
CREATE INDEX idx_user_uploads_created_at ON user_uploads(created_at);
