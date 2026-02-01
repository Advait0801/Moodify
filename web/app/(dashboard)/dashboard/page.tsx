"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

const HISTORY_KEY = "moodify_history";

interface HistoryEntry {
  emotion: string;
  date: string;
  inputType: "photo" | "text";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recent, setRecent] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const list = JSON.parse(raw) as HistoryEntry[];
        setRecent(list.slice(-5).reverse());
      }
    } catch {
      setRecent([]);
    }
  }, []);

  const displayName = user?.username ?? (user?.email ? user.email.split("@")[0] : "");

  return (
    <div className="w-full space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-primary/20 via-surface to-accent/10 border border-border p-8 sm:p-10 md:p-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-3 text-muted text-base sm:text-lg max-w-xl">
          Analyze your mood with a photo or text and get personalized music recommendations.
        </p>
        <Link
          href="/analyze"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-base font-semibold transition-opacity shadow-lg shadow-primary/25"
        >
          <span>Analyze Mood</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/analyze"
          className="block p-6 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface/80 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Photo mood</h2>
          <p className="mt-1 text-sm text-muted">Upload or capture a photo to detect your mood.</p>
        </Link>
        <Link
          href="/analyze"
          className="block p-6 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface/80 transition-all"
        >
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Text mood</h2>
          <p className="mt-1 text-sm text-muted">Describe how you feel in words.</p>
        </Link>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent activity</h2>
          <ul className="space-y-2">
            {recent.map((entry, i) => (
              <li
                key={`${entry.date}-${i}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border"
              >
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                  {entry.emotion}
                </span>
                <span className="text-sm text-muted">
                  {entry.inputType === "photo" ? "Photo" : "Text"} · {new Date(entry.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}