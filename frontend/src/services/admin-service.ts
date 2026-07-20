import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { AdminStats, AdminUsersPage, ContentSummary, UserStatus } from "@/types/admin";

export const adminService = {
  async getStats() {
    const { data } = await apiClient.get<ApiResponse<AdminStats>>("/admin/stats");
    return data.data;
  },

  async listUsers(page: number, limit: number, search?: string) {
    const { data } = await apiClient.get<ApiResponse<AdminUsersPage>>("/admin/users", {
      params: { page, limit, search: search || undefined },
    });
    return data.data;
  },

  async updateUserStatus(userId: string, status: UserStatus) {
    const { data } = await apiClient.patch<ApiResponse<{ id: string; status: UserStatus }>>(
      `/admin/users/${userId}/status`,
      { status }
    );
    return data.data;
  },

  async getContentSummary() {
    const { data } = await apiClient.get<ApiResponse<ContentSummary>>("/admin/content-summary");
    return data.data;
  },
};
