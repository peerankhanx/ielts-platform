export type QuestionType = "multiple_choice" | "true_false_not_given" | "short_answer" | "matching_heading";

export interface PassageInput {
  orderIndex: number;
  title: string;
  content: string;
}

export interface SectionInput {
  orderIndex: number;
  title: string;
}

export interface QuestionInput {
  passageIndex?: number;
  sectionIndex?: number;
  orderIndex: number;
  type: QuestionType;
  promptText: string;
  options?: string[];
  correctAnswer: string | string[];
  points?: number;
  explanation?: string;
}

export interface CreateReadingTestPayload {
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  timeLimitMinutes?: number;
  passages: PassageInput[];
  questions: QuestionInput[];
}

export interface CreateListeningTestPayload {
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  timeLimitMinutes?: number;
  sections: SectionInput[];
  questions: QuestionInput[];
}

export interface CreateWritingTaskPayload {
  title: string;
  taskType: "task_1" | "task_2";
  promptText: string;
  imageUrl?: string;
  minWords: number;
  timeLimitMinutes: number;
}

export interface SpeakingPartInput {
  partNumber: number;
  promptText: string;
  cueCardPoints?: string[];
  prepTimeSeconds?: number;
  speakTimeSeconds: number;
}

export interface CreateSpeakingTaskPayload {
  title: string;
  description?: string;
  parts: SpeakingPartInput[];
}

export interface AdminTestRow {
  id: string;
  title: string;
  description: string;
  moduleType: string;
  isPublished: boolean;
  createdAt: string;
}

export interface AdminTaskRow {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ListeningTestCreateResult {
  test: AdminTestRow;
  sections: { id: string; orderIndex: number; title: string }[];
}

export interface AdminPassage {
  id: string;
  orderIndex: number;
  title: string;
  content: string;
}

export interface AdminSection {
  id: string;
  orderIndex: number;
  title: string;
  audioUrl: string;
}

export interface AdminQuestion {
  id: string;
  passageId: string | null;
  sectionId: string | null;
  orderIndex: number;
  type: QuestionType;
  promptText: string;
  options: string[] | null;
  correctAnswer: string | string[];
  points: number;
  explanation: string | null;
}

export interface ReadingTestFull {
  test: AdminTestRow;
  passages: AdminPassage[];
  questions: AdminQuestion[];
}

export interface ListeningTestFull {
  test: AdminTestRow;
  sections: AdminSection[];
  questions: AdminQuestion[];
}
