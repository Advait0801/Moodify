"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl w-full">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-muted text-sm sm:text-base">
            {user?.email}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 transition-opacity hover:opacity-95">
          <h2 className="text-base sm:text-lg font-medium text-foreground">
            How are you feeling?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Upload a photo or describe your mood to get personalized music recommendations.
          </p>
          <Link
            href="/analyze"
            className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 text-sm sm:text-base transition-opacity"
          >
            Analyze Mood
          </Link>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <Link
            href="/analyze"
            className="rounded-lg border border-border bg-surface p-4 sm:p-5 hover:opacity-95 transition-opacity"
          >
            <span className="text-secondary text-xl sm:text-2xl" aria-hidden>📷</span>
            <h3 className="mt-2 sm:mt-3 font-medium text-foreground text-sm sm:text-base">
              Photo
            </h3>
            <p className="mt-1 text-muted text-xs sm:text-sm">
              Upload a selfie
            </p>
          </Link>
          <Link
            href="/analyze?mode=text"
            className="rounded-lg border border-border bg-surface p-4 sm:p-5 hover:opacity-95 transition-opacity"
          >
            <span className="text-accent text-xl sm:text-2xl" aria-hidden>✍️</span>
            <h3 className="mt-2 sm:mt-3 font-medium text-foreground text-sm sm:text-base">
              Text
            </h3>
            <p className="mt-1 text-muted text-xs sm:text-sm">
              Describe how you feel
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}