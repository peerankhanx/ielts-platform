export type QuestionType = "multiple_choice" | "true_false_not_given" | "short_answer" | "matching_heading";

export interface ReadingTestSummary {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimitMinutes: number;
}

export interface ReadingPassage {
  id: string;
  orderIndex: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface ReadingQuestion {
  id: string;
  passageId: string | null;
  orderIndex: number;
  type: QuestionType;
  promptText: string;
  options: string[] | null;
}

export interface ReadingTestDetail {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passages: ReadingPassage[];
  questions: ReadingQuestion[];
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  totalQuestions: number;
}

export interface AnswerBreakdown {
  questionId: string;
  promptText: string;
  type: QuestionType;
  yourAnswer: string | null;
  correctAnswer?: string | string[];
  isCorrect: boolean | null;
  explanation?: string;
}

export interface AttemptResult {
  id: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  submittedAt: string | null;
  rawScore: number | null;
  totalQuestions: number;
  bandScore: number | null;
  breakdown: AnswerBreakdown[];
}
