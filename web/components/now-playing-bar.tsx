"use client";

import { useState, useRef, useEffect } from "react";
import { getYouTubeVideoId } from "@/lib/youtube";

interface Track {
  id: string;
  name: string;
  artist: string;
  preview_url?: string;
  youtube_video_id?: string;
}

interface NowPlayingBarProps {
  track: Track | null;
  isSpotifyTrack: (id: string) => boolean;
  isPlayablePreview: (url: string) => boolean;
  isYouTubeTrack: (url?: string) => boolean;
  onClose: () => void;
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export function NowPlayingBar({
  track,
  isSpotifyTrack,
  isPlayablePreview,
  isYouTubeTrack,
  onClose,
}: NowPlayingBarProps) {
  if (!track) return null;

  const hasPreview = track.preview_url && isPlayablePreview(track.preview_url);
  const hasSpotify = isSpotifyTrack(track.id);
  const hasYouTube = isYouTubeTrack(track.preview_url);

  if (hasPreview) {
    return (
      <NowPlayingAudio
        track={track}
        onClose={onClose}
      />
    );
  }

  if (hasYouTube) {
    return (
      <NowPlayingYouTube
        track={track}
        onClose={onClose}
      />
    );
  }

  if (hasSpotify) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
            <p className="text-xs text-muted truncate">{track.artist}</p>
          </div>
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="max-w-full sm:max-w-[280px] rounded-lg shrink-0"
            title={`Play ${track.name} on Spotify`}
          />
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground shrink-0 self-start sm:self-center"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function NowPlayingYouTube({ track, onClose }: { track: Track; onClose: () => void }) {
  const [videoId, setVideoId] = useState<string | null>(track.youtube_video_id ?? null);
  const [loading, setLoading] = useState(!track.youtube_video_id);

  useEffect(() => {
    if (track.youtube_video_id) {
      const id = track.youtube_video_id;
      queueMicrotask(() => {
        setVideoId(id);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setVideoId(null);
        setLoading(true);
      }
    });
    const query = `${track.name} ${track.artist}`;
    getYouTubeVideoId(query)
      .then((id) => {
        if (!cancelled) setVideoId(id);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [track.name, track.artist, track.youtube_video_id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center p-8">
          <p className="text-foreground font-medium">{track.name}</p>
          <p className="text-muted text-sm mt-1">{track.artist}</p>
          <p className="text-muted text-sm mt-4">Loading video…</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 px-4 py-2 rounded-lg bg-surface border border-border text-foreground hover:bg-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center p-8">
          <p className="text-foreground font-medium">{track.name}</p>
          <p className="text-muted text-sm mt-1">{track.artist}</p>
          <p className="text-muted text-sm mt-4">Video not found</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 px-4 py-2 rounded-lg bg-surface border border-border text-foreground hover:bg-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl flex flex-col items-center gap-4">
        <div className="w-full aspect-video max-h-[70vh] rounded-xl overflow-hidden border border-border shadow-2xl bg-surface">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={`Play ${track.name} on YouTube`}
          />
        </div>
        <div className="flex items-center gap-4 w-full max-w-4xl justify-between">
          <div className="min-w-0">
            <p className="text-foreground font-medium truncate">{track.name}</p>
            <p className="text-muted text-sm truncate">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-5 py-2.5 rounded-lg bg-surface border border-border text-foreground hover:bg-border transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function NowPlayingAudio({ track, onClose }: { track: Track; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!track.preview_url) return;
    const audio = new Audio(track.preview_url);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [track.preview_url]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }

  function formatTime(seconds: number) {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 shrink-0"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
            <p className="text-xs text-muted truncate">{track.artist}</p>
          </div>
          <span className="text-xs text-muted shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground shrink-0"
          >
            Close
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 30}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full appearance-none bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>
    </div>
  );
}
