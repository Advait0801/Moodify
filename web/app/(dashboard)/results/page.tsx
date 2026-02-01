"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MoodAnalyzeResponse } from "@/lib/types";

const RESULT_KEY = "moodify_analyze_result";

function isSpotifyTrack(id: string) {
  return !id.startsWith("fallback-") && id.length === 22;
}

function isPlayableAudioUrl(url: string) {
  return url.includes("p.scdn.co") || url.endsWith(".mp3");
}

function isValidResult(data: unknown): data is MoodAnalyzeResponse {
  if(!data || typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  const emotion = o.emotion as Record<string, unknown> | undefined;
  const recommendations = o.recommendations as Record<string, unknown> | undefined;
  return (
    !!emotion &&
    typeof emotion.predicted === "string" &&
    typeof emotion.confidence === "number" &&
    !!recommendations &&
    Array.isArray(recommendations.tracks)
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState<MoodAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if(typeof window === "undefined") return;
    const raw = sessionStorage.getItem(RESULT_KEY);
    if(!raw) {
      router.replace("/analyze");
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if(cancelled) return;
      try {
        const parsed = JSON.parse(raw) as unknown;
        if(isValidResult(parsed)) {
          setResult(parsed);
        } else {
          setError("Invalid or incomplete results. Please try again.");
        }
      } catch {
        setError("Could not load results. Please try again.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function togglePreview(trackId: string, previewUrl: string) {
    if(playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if(!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = previewUrl;
    audio.play().catch(() => {
      setPlayingId(null);
    });
    setPlayingId(trackId);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if(!audio) return;
    const handleEnded = () => setPlayingId(null);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl w-full">
        <div className="p-4 sm:p-6 rounded-lg bg-surface border border-border border-red-500/50">
          <p className="text-sm sm:text-base font-normal text-red-400" role="alert">
            {error}
          </p>
          <Link
            href="/analyze"
            className="mt-4 inline-flex items-center justify-center min-h-[48px] min-w-[140px] px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm sm:text-base font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if(!result) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-muted text-sm sm:text-base font-normal">Loading results…</p>
      </div>
    );
  }

  const { emotion, recommendations } = result;
  const confidencePercent = Math.round(emotion.confidence * 100);

  return (
    <div className="max-w-2xl w-full pb-20 sm:pb-8">
      <Link
        href="/analyze"
        className="inline-block text-sm text-secondary hover:opacity-80 transition-opacity mb-4 sm:mb-6"
      >
        ← Analyze again
      </Link>

      <div className="space-y-6 sm:space-y-8">
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
            Detected mood
          </h2>
          <div className="p-4 sm:p-6 rounded-lg bg-surface border border-border">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
              {emotion.predicted}
            </span>
            <p className="mt-2 text-sm text-muted">
              Confidence: {confidencePercent}%
              {emotion.face_detected === false && " (no face detected)"}
            </p>
          </div>
        </section>

        {recommendations.explanation && (
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
              Why this music?
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {recommendations.explanation}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
            Recommended tracks
          </h2>
          <ul className="space-y-3">
            {recommendations.tracks.map((track) => (
              <li
                key={track.id}
                className="p-4 rounded-lg bg-surface border border-border flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {track.name}
                  </p>
                  <p className="text-sm text-muted truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {track.preview_url && isPlayableAudioUrl(track.preview_url) && (
                    <button
                      type="button"
                      onClick={() => togglePreview(track.id, track.preview_url!)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {playingId === track.id ? "Pause" : "Preview"}
                    </button>
                  )}
                  {isSpotifyTrack(track.id) && (
                    <a
                      href={`https://open.spotify.com/track/${track.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md bg-[#1DB954] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Open in Spotify
                    </a>
                  )}
                  {track.preview_url && track.preview_url.includes("youtube.com") && (
                    <a
                      href={track.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Search on YouTube
                    </a>
                  )}
                  {!track.preview_url && !isSpotifyTrack(track.id) && (
                    <span className="text-xs text-muted">No preview</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {recommendations.tracks.length === 0 && (
            <p className="text-muted text-sm py-4">No tracks found.</p>
          )}
        </section>
      </div>
    </div>
  );
}