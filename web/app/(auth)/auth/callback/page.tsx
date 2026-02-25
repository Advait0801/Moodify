"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth-storage";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    const spotifyError = searchParams.get("spotify");
    const spotifyConnected = searchParams.get("spotify") === "connected";

    if (spotifyError && !token && !spotifyConnected) {
      setStatus("error");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    if (spotifyConnected) {
      setStatus("success");
      setTimeout(() => router.replace("/dashboard"), 1200);
      return;
    }

    if (!token) {
      setStatus("error");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    setToken(token);
    refreshUser()
      .then(() => {
        setStatus("success");
        setTimeout(() => router.replace("/dashboard"), 800);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => router.replace("/login"), 2000);
      });
  }, [searchParams, router, refreshUser]);

  return (
    <div className="w-full max-w-sm mx-auto text-center py-12">
      {status === "loading" && (
        <p className="text-muted text-sm">Signing you in…</p>
      )}
      {status === "success" && (
        <p className="text-foreground text-sm font-medium">Success! Redirecting…</p>
      )}
      {status === "error" && (
        <p className="text-destructive text-sm">Something went wrong. Redirecting to login…</p>
      )}
    </div>
  );
}
