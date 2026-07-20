export type NotificationType = "ai_evaluation" | "subscription" | "test" | "achievement" | "reminder" | "payment";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  items: NotificationItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
