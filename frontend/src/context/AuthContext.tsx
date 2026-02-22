"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_BASE = API_URL.replace(/\/$/, "");

interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

interface User {
  _id: string;
  email: string;
  role: "student" | "admin";
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getErrorMessage(payload: any, fallback: string) {
  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors[0]?.msg || fallback;
  }
  return fallback;
}

function getNetworkError(error: unknown, action: string) {
  if (error instanceof TypeError) {
    return new Error(
      `Unable to ${action}. Cannot reach API at ${API_BASE}. Check backend server and CORS FRONTEND_ADDRESS.`
    );
  }
  return error instanceof Error ? error : new Error(`Failed to ${action}`);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users/status`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(getErrorMessage(data, "Login failed"));
      }
      const data = await res.json();
      setUser(data.user ?? data);
    } catch (error) {
      throw getNetworkError(error, "log in");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(getErrorMessage(err, "Registration failed"));
      }
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error) {
      throw getNetworkError(error, "register");
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === "admin", login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
