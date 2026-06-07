"use client";

import { useAuth } from "@/context/AuthContext";

export function useAuthLink(destination: string): string {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return `/auth?redirect=${encodeURIComponent(destination)}`;
  }
  return destination;
}