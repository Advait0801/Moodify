"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-[2rem] sm:text-[2.25rem] md:text-[2.5rem] font-bold text-center text-foreground">
        Moodify
      </h1>
      <p className="text-muted text-center text-sm sm:text-base font-normal max-w-xs sm:max-w-md md:max-w-lg">
        Get music recommendations based on your mood. Upload a photo or describe how you feel.
      </p>
      {isLoading ? (
        <p className="text-muted text-sm sm:text-base font-normal">Loading…</p>
      ) : isAuthenticated ? (
        <Link
          href="/dashboard"
          className="min-h-[48px] min-w-[140px] inline-flex items-center justify-center px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-center text-sm sm:text-base font-medium transition-opacity"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
          <Link
            href="/login"
            className="w-full sm:w-auto min-h-[48px] min-w-[140px] inline-flex items-center justify-center px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-center text-sm sm:text-base font-medium transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto min-h-[48px] min-w-[140px] inline-flex items-center justify-center px-4 py-3 rounded-md border border-border bg-surface hover:opacity-90 text-foreground text-center text-sm sm:text-base font-medium transition-opacity"
          >
            Register
          </Link>
        </div>
      )}
    </main>
  );
}