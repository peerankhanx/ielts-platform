import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

/**
 * Central API client.
 *
 * - Base URL is versioned (/api/v1) per the API standards in the spec.
 * - Access tokens are attached from the in-memory auth store, never localStorage.
 * - Refresh tokens live in an HttpOnly cookie set by the backend, so the browser
 *   never has direct access to them (withCredentials handles the cookie exchange).
 * - A single refresh-then-retry flow prevents duplicate refresh calls from firing
 *   when several requests 401 at the same time.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ data: { accessToken: string } }>("/auth/refresh")
      .then((res) => res.data.data.accessToken)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        useAuthStore.getState().setAccessToken(newToken);
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(original);
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);
