import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types";
import type { NotificationsPage } from "@/types/notification";

export const notificationsService = {
  async list(page = 1, limit = 20) {
    const { data } = await apiClient.get<ApiResponse<NotificationsPage>>("/notifications", {
      params: { page, limit },
    });
    return data.data;
  },

  async unreadCount() {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
    return data.data.count;
  },

  async markRead(notificationId: string) {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/notifications/${notificationId}/read`);
    return data.data;
  },

  async markAllRead() {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean }>>("/notifications/read-all");
    return data.data;
  },
};
