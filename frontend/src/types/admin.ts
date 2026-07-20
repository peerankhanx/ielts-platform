export interface AdminStats {
  users: { total: number; students: number; admins: number };
  completedAttempts: { reading: number; listening: number; writing: number; speaking: number };
  averageCurrentBand: number | null;
}

export type UserStatus = "active" | "suspended" | "pending";

export interface AdminUserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: UserStatus;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminUsersPage {
  items: AdminUserRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContentSummary {
  readingTests: number;
  listeningTests: number;
  writingTasks: number;
  speakingTasks: number;
}
