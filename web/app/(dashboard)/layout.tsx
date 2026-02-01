"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  useRequireAuth();
  const displayName = user?.username ?? user?.email?.split("@")[0] ?? "";
  const initials = displayName.length >= 2 ? displayName.slice(0, 2).toUpperCase() : displayName ? displayName[0].toUpperCase() : "?";

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
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex items-center gap-2 text-sm sm:text-base font-normal text-muted hover:text-foreground transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden shrink-0">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </span>
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
      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}