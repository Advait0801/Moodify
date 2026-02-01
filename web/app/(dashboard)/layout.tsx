"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, logout } = useAuth();
  useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted text-sm sm:text-base font-normal">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-surface shrink-0">
        <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <Link
            href="/dashboard"
            className="font-semibold text-xl sm:text-2xl text-foreground"
          >
            Moodify
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/profile"
              className="text-sm sm:text-base font-normal text-muted hover:text-foreground transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="text-sm sm:text-base font-medium text-secondary hover:opacity-80 transition-opacity"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}