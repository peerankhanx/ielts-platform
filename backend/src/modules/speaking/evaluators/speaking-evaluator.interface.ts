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

export interface SpeakingResponseInput {
  partNumber: number;
  durationSeconds: number;
  silenceSeconds: number;
  pauseCount: number;
  expectedSeconds: number;
}

export interface SpeakingEvaluator {
  evaluate(
    responses: SpeakingResponseInput[],
  ): Promise<SpeakingEvaluationResult>;
}
