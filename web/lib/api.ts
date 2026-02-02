import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  MoodAnalyzeResponse,
} from "./types";
import { getToken, clearAuth } from "./auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

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

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (err) {
    if (typeof window !== "undefined" && window.location?.protocol === "https:" && BASE_URL.startsWith("http://")) {
      throw new ApiError(
        "Cannot reach the API: this site uses HTTPS but the API URL is HTTP. Browsers block that. Use HTTPS for the API (e.g. load balancer with SSL) or set NEXT_PUBLIC_API_URL to an HTTPS URL.",
        0
      );
    }
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(msg || "Cannot reach the server. Check your connection and that the API is running.", 0);
  }

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

  async getProfile(): Promise<{ id: string; email: string; username?: string | null; profilePicture?: string | null }> {
    return request("/users/me");
  },

  async updateProfile(data: { profilePicture?: string | null }): Promise<{ id: string; email: string; username?: string | null; profilePicture?: string | null }> {
    return request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return request("/users/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async analyzeMood(image: File): Promise<MoodAnalyzeResponse> {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", image);

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/mood/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
    } catch (err) {
      if (typeof window !== "undefined" && window.location?.protocol === "https:" && BASE_URL.startsWith("http://")) {
        throw new ApiError(
          "Cannot reach the API: this site uses HTTPS but the API URL is HTTP. Use HTTPS for the API.",
          0
        );
      }
      const msg = err instanceof Error ? err.message : "Network error";
      throw new ApiError(msg || "Cannot reach the server.", 0);
    }

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