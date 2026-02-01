const TOKEN_KEY = "moodify_token";
const USER_KEY = "moodify_user";

export function getToken(): string | null {
  if(typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if(typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if(typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): { id: string; email: string } | null {
  if(typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: { id: string; email: string }): void {
  if(typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  if(typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}