import { apiClient } from "@/services/api-client";
import type { ApiResponse, User } from "@/types";
import type { LoginFormValues, RegisterFormValues } from "@/utils/validation/auth-schemas";

interface LoginResult {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(values: LoginFormValues) {
    const { data } = await apiClient.post<ApiResponse<LoginResult>>("/auth/login", values);
    return data.data;
  },

  async register(values: RegisterFormValues) {
    const { firstName, lastName, email, password } = values;
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return data.data;
  },

  async refresh() {
    const { data } = await apiClient.post<ApiResponse<LoginResult>>("/auth/refresh");
    return data.data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },
};