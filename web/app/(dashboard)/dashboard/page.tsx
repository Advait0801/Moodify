"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
        Welcome back
        {user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>
      <p className="mt-2 sm:mt-3 text-muted text-sm sm:text-base">
        Analyze your mood with a photo or text to get music recommendations.
      </p>
      <Link
        href="/analyze"
        className="mt-4 sm:mt-6 inline-block px-4 py-2.5 sm:py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm sm:text-base font-medium transition-opacity"
      >
        Analyze Mood
      </Link>
    </div>
  );
}