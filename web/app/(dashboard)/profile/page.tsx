"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PasswordInput } from "@/components/ui/password-input";
import type { UserUploadItem } from "@/lib/types";

const MAX_IMAGE_SIZE = 500 * 1024;

function getInitials(user: { email: string; username?: string | null }) {
  const base = user.username?.trim() || user.email.split("@")[0] || "";
  if (!base) return "?";
  if (base.length >= 2) return base.slice(0, 2).toUpperCase();
  return base[0].toUpperCase();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [uploads, setUploads] = useState<UserUploadItem[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);
  const [spotifyConnectLoading, setSpotifyConnectLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) return;
    api.getSpotifyStatus().then((s) => setSpotifyConnected(s.connected)).catch(() => setSpotifyConnected(false));
  }, [user]);

  useEffect(() => {
    if (searchParams.get("spotify") === "connected") {
      setSpotifyConnected(true);
      toast.success("Spotify connected.");
      window.history.replaceState({}, "", "/profile");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setUploadsLoading(true);
    api
      .getUploads()
      .then(({ uploads: list }) => {
        if (!cancelled) setUploads(list);
        const imageIds = list.filter((u) => u.type === "image").map((u) => u.id);
        imageIds.forEach((id) => {
          api
            .getUploadImageBlob(id)
            .then((blob) => {
              if (cancelled) return;
              const url = URL.createObjectURL(blob);
              blobUrlsRef.current.push(url);
              setImageUrls((prev) => ({ ...prev, [id]: url }));
            })
            .catch(() => {});
        });
      })
      .catch(() => setUploads([]))
      .finally(() => {
        if (!cancelled) setUploadsLoading(false);
      });
    return () => {
      cancelled = true;
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
      blobUrlsRef.current = [];
    };
  }, [user]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handlePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 500 KB.");
      return;
    }
    setPictureLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await api.updateProfile({ profilePicture: dataUrl });
      await refreshUser();
      toast.success("Profile picture updated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update picture.");
    } finally {
      setPictureLoading(false);
      e.target.value = "";
    }
  }

  async function handleRemovePicture() {
    setPictureLoading(true);
    try {
      await api.updateProfile({ profilePicture: null });
      await refreshUser();
      toast.success("Profile picture removed.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove picture.");
    } finally {
      setPictureLoading(false);
    }
  }

  async function handleConnectSpotify() {
    setSpotifyConnectLoading(true);
    try {
      const { url } = await api.getSpotifyConnectUrl();
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start Spotify connect.");
      setSpotifyConnectLoading(false);
    }
  }

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

  const initials = getInitials(user);
  const hasPicture = !!user.profilePicture;

  return (
    <div className="w-full space-y-8">
      <Link
        href="/dashboard"
        className="inline-block text-sm text-secondary hover:opacity-80 transition-opacity mb-2"
      >
        ← Dashboard
      </Link>
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 rounded-2xl bg-surface border border-border">
        <div className="flex flex-col items-start gap-3 shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg overflow-hidden">
            {hasPicture ? (
              <img src={user.profilePicture!} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pictureLoading}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pictureLoading ? "Updating…" : hasPicture ? "Update" : "Add photo"}
            </button>
            {hasPicture && (
              <button
                type="button"
                onClick={handleRemovePicture}
                disabled={pictureLoading}
                className="px-3 py-1.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-surface/80 disabled:opacity-50 transition-opacity"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Profile</h1>
          {user.username && (
            <div>
              <label className="block text-sm font-medium text-muted mb-0.5">Username</label>
              <p className="text-sm sm:text-base text-foreground">{user.username}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted mb-0.5">Email</label>
            <p className="text-sm sm:text-base text-foreground">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-0.5">User ID</label>
            <p className="text-xs text-muted font-mono break-all">{user.id}</p>
          </div>
        </div>
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">Spotify</h2>
        <p className="text-sm text-muted mb-4">Link your Spotify account for personalized playlists.</p>
        {spotifyConnected === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : spotifyConnected ? (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1DB954]/10 text-[#1DB954] text-sm font-medium">
            <SpotifyIcon className="w-4 h-4" />
            Connected
          </div>
        ) : (
          <button
            type="button"
            onClick={handleConnectSpotify}
            disabled={spotifyConnectLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-[#1DB954]/10 text-[#1DB954] text-sm font-medium hover:bg-[#1DB954]/20 disabled:opacity-50 transition-colors"
          >
            <SpotifyIcon className="w-4 h-4" />
            {spotifyConnectLoading ? "Opening…" : "Connect Spotify"}
          </button>
        )}
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-surface border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Change password</h2>
        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-foreground mb-2">Current password</label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">New password</label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">Confirm new password</label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={passwordLoading}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {passwordLoading ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Past recommendations</h2>
        {uploadsLoading ? (
          <div className="p-8 rounded-xl bg-surface border border-border text-center">
            <p className="text-muted text-sm">Loading…</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-border text-center">
            <p className="text-muted text-sm">No uploads yet. Your photos and text will appear here.</p>
            <Link
              href="/analyze"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Analyze mood
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {uploads.map((upload) => (
              <li
                key={upload.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-border"
              >
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  {upload.type === "image" ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {imageUrls[upload.id] ? (
                        <img
                          src={imageUrls[upload.id]}
                          alt="Upload"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                          …
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground line-clamp-2">
                      {upload.text_content ?? "—"}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted shrink-0">
                  {new Date(upload.created_at).toLocaleDateString()}{" "}
                  {new Date(upload.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
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