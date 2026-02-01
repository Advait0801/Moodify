import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  MoodAnalyzeResponse,
} from "./types";
import { getToken, clearAuth } from "./auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string | null; skipAuthClear?: boolean }
): Promise<T> {
  const { token, skipAuthClear, ...init } = options ?? {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const authToken = token ?? (typeof window !== "undefined" ? getToken() : null);
  if(authToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if(res.status === 401 && !skipAuthClear) {
    clearAuth();
    if(typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if(!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
      skipAuthClear: true,
    });
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
      skipAuthClear: true,
    });
  },

  async getProfile(): Promise<{ id: string; email: string }> {
    return request("/users/me");
  },

  async analyzeMood(image: File): Promise<MoodAnalyzeResponse> {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch(`${BASE_URL}/mood/analyze`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (res.status === 401) {
      clearAuth();
      if(typeof window !== "undefined") window.location.href = "/login";
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = (err as { error?: string }).error ?? `Request failed: ${res.status}`;
      throw new ApiError(message, res.status);
    }

    return res.json() as Promise<MoodAnalyzeResponse>;
  },

  async analyzeMoodFromText(text: string): Promise<MoodAnalyzeResponse> {
    return request("/mood/analyze/text", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },
};