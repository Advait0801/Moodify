"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  function handleSpotifyLogin() {
    const base = API_BASE_URL.replace(/\/$/, "");
    window.location.href = `${base}/auth/spotify`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password) {
      toast.error("Email, username and password are required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await register({ email: email.trim(), username: username.trim(), password });
      toast.success("Account created! Welcome to Moodify.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base font-normal"
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base font-normal"
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] px-4 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm sm:text-base"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>
        <div className="relative my-2">
          <span className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </span>
          <span className="relative flex justify-center text-xs font-medium text-muted">
            or
          </span>
        </div>
        <button
          type="button"
          onClick={handleSpotifyLogin}
          disabled={isLoading}
          className="w-full min-h-[48px] px-4 py-3 rounded-md border border-border bg-[#1DB954]/10 text-[#1DB954] font-medium hover:bg-[#1DB954]/20 disabled:opacity-50 transition-colors text-sm sm:text-base inline-flex items-center justify-center gap-2"
        >
          <SpotifyIcon className="w-5 h-5 shrink-0" />
          Sign up with Spotify
        </button>
      </form>
      <p className="text-sm sm:text-base font-normal text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-secondary hover:opacity-80 transition-opacity font-medium">
          Login
        </Link>
      </p>
      <Link href="/" className="inline-block text-sm sm:text-base font-normal text-secondary hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
    </div>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}