"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

interface User {
  _id: string;
  name: string;
  phone: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  getAuthHeader: () => Record<string, string>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  getAuthHeader: () => ({}),
  deleteAccount: async () => {},
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("ace_token");
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          localStorage.removeItem("ace_token");
        }
      } catch {
        // not logged in
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const login = useCallback((userData: User, token: string) => {
    localStorage.setItem("ace_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("ace_token");
    setUser(null);
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
    } catch {}
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("ace_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const deleteAccount = useCallback(async () => {
    const token = localStorage.getItem("ace_token");
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let message = "Failed to delete account";
      try {
        const data = await res.json();
        message = data.message || message;
      } catch {}
      throw new Error(message);
    }
    localStorage.removeItem("ace_token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, getAuthHeader, deleteAccount }),
    [user, loading, login, logout, getAuthHeader, deleteAccount]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}