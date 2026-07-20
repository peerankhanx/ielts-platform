import type { QuestionType } from "./reading";

export interface ListeningTestSummary {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimitMinutes: number;
}

export interface ListeningSection {
  id: string;
  orderIndex: number;
  title: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface ListeningQuestion {
  id: string;
  sectionId: string | null;
  orderIndex: number;
  type: QuestionType;
  promptText: string;
  options: string[] | null;
}

export interface ListeningTestDetail {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  sections: ListeningSection[];
  questions: ListeningQuestion[];
}
