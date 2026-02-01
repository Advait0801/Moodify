"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  trackName: string;
  artist: string;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
  compact?: boolean;
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

export function AudioPlayer({
  src,
  trackName,
  artist,
  isActive,
  onPlay,
  onPause,
  compact = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onPause();
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
  }, [src, onPause]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isActive) {
      audioRef.current.volume = volume;
    }
  }, [isActive, volume]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      onPause();
    } else {
      audioRef.current.play().catch(() => onPause());
      onPlay();
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

  if (!isActive) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className="text-sm text-muted truncate max-w-[120px]">
          {trackName} – {artist}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface border border-border">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 shrink-0"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{trackName}</p>
          <p className="text-xs text-muted truncate">{artist}</p>
        </div>
        <span className="text-xs text-muted shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
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
  );
}
