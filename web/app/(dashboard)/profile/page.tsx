"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PasswordInput } from "@/components/ui/password-input";

const HISTORY_KEY = "moodify_history";
const MAX_IMAGE_SIZE = 500 * 1024;

interface HistoryEntry {
  emotion: string;
  date: string;
  inputType: "photo" | "text";
}

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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const list = JSON.parse(raw) as HistoryEntry[];
        setHistory([...list].reverse());
      }
    } catch {
      setHistory([]);
    }
  }, []);

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
        {history.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-border text-center">
            <p className="text-muted text-sm">No past analyses yet.</p>
            <Link
              href="/analyze"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Analyze mood
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((entry, i) => (
              <li
                key={`${entry.date}-${i}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border"
              >
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent shrink-0">
                  {entry.emotion}
                </span>
                <span className="text-sm text-muted shrink-0">
                  {entry.inputType === "photo" ? "Photo upload" : "Text"}
                </span>
                <span className="text-sm text-muted ml-auto shrink-0">
                  {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}