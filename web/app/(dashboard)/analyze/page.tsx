"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { MoodAnalyzeResponse } from "@/lib/types";

const RESULT_KEY = "moodify_analyze_result";

type Mode = "photo" | "text";

export default function AnalyzePage() {
  const [mode, setMode] = useState<Mode>("photo");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if(dropped?.type.startsWith("image/")) {
      setFile(dropped);
    } else {
      toast.error("Please upload an image file (JPEG, PNG, etc.).");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if(selected?.type.startsWith("image/")) {
      setFile(selected);
    } else if (selected) {
      toast.error("Please select an image file (JPEG, PNG, etc.).");
    }
  }

  function clearFile() {
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result: MoodAnalyzeResponse;
      if(mode === "photo") {
        if(!file) {
          toast.error("Please upload an image.");
          setIsLoading(false);
          return;
        }
        result = await api.analyzeMood(file);
      } else {
        const trimmed = text.trim();
        if(!trimmed) {
          toast.error("Please describe how you feel.");
          setIsLoading(false);
          return;
        }
        result = await api.analyzeMoodFromText(trimmed);
      }
      if(typeof window !== "undefined") {
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      }
      toast.success("Here are your recommendations!");
      router.push("/results");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl w-full">
      <Link
        href="/dashboard"
        className="inline-block text-sm text-secondary hover:opacity-80 transition-opacity mb-4 sm:mb-6"
      >
        ← Dashboard
      </Link>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
        Analyze Mood
      </h1>
      <p className="mt-2 sm:mt-3 text-muted text-sm sm:text-base">
        Upload a photo or describe how you feel to get personalized music.
      </p>

      <div className="mt-6 sm:mt-8 flex gap-2 p-1 rounded-lg bg-surface border border-border w-fit">
        <button
          type="button"
          onClick={() => {
            setMode("photo");
            setFile(null);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-opacity ${
            mode === "photo"
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Photo
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("text");
            setText("");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-opacity ${
            mode === "text"
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        {mode === "photo" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload your photo
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-opacity ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-surface/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">{file.name}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      clearFile();
                    }}
                    className="text-sm text-secondary hover:opacity-80"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Drag and drop an image here, or click to browse
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="mood-text" className="block text-sm font-medium text-foreground mb-2">
              How are you feeling?
            </label>
            <textarea
              id="mood-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I had a rough day at work, need something uplifting..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base resize-none"
              disabled={isLoading}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm sm:text-base"
        >
          {isLoading ? "Analyzing…" : "Get Recommendations"}
        </button>
      </form>
    </div>
  );
}