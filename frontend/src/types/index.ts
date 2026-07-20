export type Role = "student" | "admin" | "super_admin" | "content_manager" | "support_staff";

export type ModuleType = "reading" | "listening" | "writing" | "speaking";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  country?: string;
  targetBand: number;
  currentBand: number;
  studyGoal?: string;
  preferredTestType: "academic" | "general";
  examDate?: string;
}

export interface ModuleProgress {
  module: ModuleType;
  currentBand: number;
  progressPercent: number;
}

export interface ProgressRecord {
  readingBand: number;
  listeningBand: number;
  writingBand: number;
  speakingBand: number;
  overallBand: number;
  studyTimeMinutes: number;
  recordedAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  moduleType: ModuleType | "full-mock";
  status: "in_progress" | "completed" | "abandoned";
  score?: number;
  bandScore?: number;
  startTime: string;
  endTime?: string;
}

export interface WritingEvaluation {
  taskAchievement: number;
  coherence: number;
  lexical: number;
  grammar: number;
  overallBand: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface SpeakingEvaluation {
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  overallBand: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ai_evaluation" | "subscription" | "test" | "achievement" | "reminder" | "payment";
  isRead: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxTests: number | null;
  aiAccess: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
