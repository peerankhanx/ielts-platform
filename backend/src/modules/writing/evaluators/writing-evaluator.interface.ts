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
  evaluator: 'heuristic' | 'claude';
}

export interface WritingEvaluator {
  evaluate(params: {
    promptText: string;
    essayText: string;
    minWords: number;
  }): Promise<WritingEvaluationResult>;
}
