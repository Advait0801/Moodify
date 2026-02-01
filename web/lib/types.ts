export interface User {
  id: string;
  email: string;
  username?: string | null;
  profilePicture?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface MoodAnalyzeResponse {
  emotion: {
    predicted: string;
    confidence: number;
    probabilities: Record<string, number>;
    face_detected: boolean;
  };
  recommendations: {
    tracks: Array<{
      id: string;
      name: string;
      artist: string;
      preview_url?: string;
      youtube_video_id?: string;
    }>;
    playlist_id?: string;
    explanation?: string;
  };
}