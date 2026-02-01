"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getUser,
  setToken,
  setUser,
  clearAuth,
} from "@/lib/auth-storage";
import { api } from "@/lib/api";
import type { User, LoginDto, RegisterDto } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if(!token) {
      setUserState(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUserState(profile);
      setUser(profile);
    } catch {
      clearAuth();
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if(!token) {
      setUserState(getUser());
      setIsLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (dto: LoginDto) => {
      const res = await api.login(dto);
      setToken(res.token);
      setUser(res.user);
      setUserState(res.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      const res = await api.register(dto);
      setToken(res.token);
      setUser(res.user);
      setUserState(res.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    router.push("/");
  }, [router]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if(!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}