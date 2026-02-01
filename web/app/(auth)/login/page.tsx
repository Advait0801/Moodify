"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Login</h2>
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
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base font-normal"
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm sm:text-base font-normal text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] px-4 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm sm:text-base"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm sm:text-base font-normal text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-secondary hover:opacity-80 transition-opacity font-medium">
          Register
        </Link>
      </p>
      <Link href="/" className="inline-block text-sm sm:text-base font-normal text-secondary hover:opacity-80 transition-opacity">
        ← Back to home
      </Link>
    </div>
  );
}