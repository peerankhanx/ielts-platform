export type WritingTaskType = "task_1" | "task_2";

export interface WritingTaskSummary {
  id: string;
  title: string;
  taskType: WritingTaskType;
  minWords: number;
  timeLimitMinutes: number;
}

export interface WritingTaskDetail {
  id: string;
  title: string;
  taskType: WritingTaskType;
  promptText: string;
  imageUrl: string | null;
  minWords: number;
  timeLimitMinutes: number;
}

export interface WritingEvaluationResult {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  evaluator: "heuristic" | "claude";
}

export interface WritingSubmission {
  id: string;
  taskId: string;
  essayText: string;
  wordCount: number;
  status: "in_progress" | "evaluating" | "evaluated";
  startedAt: string;
  submittedAt: string | null;
  evaluation: WritingEvaluationResult | null;
}
