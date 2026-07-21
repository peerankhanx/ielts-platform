"use client";

import { useEffect } from "react";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

export function useAuthRestore() {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    authService
      .refresh()
      .then(({ user, accessToken }) => {
        setAccessToken(accessToken);
        setUser(user);
      })
      .catch(() => {
        // Not logged in
      });
  }, []);
}