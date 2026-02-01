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
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
      setVideoId(track.youtube_video_id);
      setLoading(false);
      return;
    }
    const query = `${track.name} ${track.artist}`;
    getYouTubeVideoId(query)
      .then((id) => {
        setVideoId(id);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [track.name, track.artist, track.youtube_video_id]);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
            <p className="text-xs text-muted truncate">{track.artist}</p>
          </div>
          <p className="text-sm text-muted">Loading…</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
            <p className="text-xs text-muted truncate">{track.artist}</p>
          </div>
          <p className="text-sm text-muted">Video not found</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
          <p className="text-xs text-muted truncate">{track.artist}</p>
        </div>
        <div className="w-full sm:w-[320px] aspect-video sm:aspect-auto sm:h-20 shrink-0 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={`Play ${track.name} on YouTube`}
          />
        </div>
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
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
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
