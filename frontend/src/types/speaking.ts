export interface SpeakingTaskSummary {
  id: string;
  title: string;
  description: string;
}

export interface SpeakingPart {
  id: string;
  partNumber: number;
  promptText: string;
  cueCardPoints: string[] | null;
  prepTimeSeconds: number;
  speakTimeSeconds: number;
}

export interface SpeakingTaskDetail {
  id: string;
  title: string;
  description: string;
  parts: SpeakingPart[];
}

export interface SpeakingEvaluationResult {
  fluencyCoherence: number | null;
  lexicalResource: number | null;
  grammaticalRange: number | null;
  pronunciation: number | null;
  overallBand: number | null;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  evaluator: string;
}

export interface SpeakingResponseSummary {
  partId: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface SpeakingSubmission {
  id: string;
  taskId: string;
  status: "in_progress" | "evaluating" | "evaluated";
  startedAt: string;
  submittedAt: string | null;
  responses: SpeakingResponseSummary[];
  evaluation: SpeakingEvaluationResult | null;
}
