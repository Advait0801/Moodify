"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl w-full">
      <Link
        href="/dashboard"
        className="inline-block text-sm text-secondary hover:opacity-80 transition-opacity mb-4 sm:mb-6"
      >
        ← Dashboard
      </Link>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Profile
      </h1>
      <div className="p-4 sm:p-6 rounded-lg bg-surface border border-border space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1">Email</label>
          <p className="text-sm sm:text-base text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1">User ID</label>
          <p className="text-sm text-muted font-mono break-all">{user.id}</p>
        </div>
      </div>
    </div>
  );
}