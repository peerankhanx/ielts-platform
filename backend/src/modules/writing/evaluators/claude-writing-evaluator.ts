import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type {
  WritingEvaluator,
  WritingEvaluationResult,
} from './writing-evaluator.interface';

const SYSTEM_PROMPT = `You are an IELTS Writing examiner. Score the essay strictly against the four official
IELTS Writing band descriptors: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and
Grammatical Range and Accuracy. Each is scored 0-9 in 0.5 increments. The overall band is the average of the
four, rounded to the nearest 0.5.

Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "taskAchievement": number,
  "coherenceCohesion": number,
  "lexicalResource": number,
  "grammaticalRange": number,
  "overallBand": number,
  "feedback": {
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[]
  }
}`;

/**
 * Real LLM-based evaluation using Claude. Only active when ANTHROPIC_API_KEY
 * is set — otherwise WritingModule falls back to HeuristicWritingEvaluator.
 * This is the evaluator that should be used in any real deployment; the
 * heuristic one exists purely so the pipeline is testable without a key.
 */
@Injectable()
export class ClaudeWritingEvaluator implements WritingEvaluator {
  private readonly logger = new Logger(ClaudeWritingEvaluator.name);
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async evaluate({
    promptText,
    essayText,
    minWords,
  }: {
    promptText: string;
    essayText: string;
    minWords: number;
  }): Promise<WritingEvaluationResult> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Task prompt (minimum ${minWords} words):\n${promptText}\n\nStudent's essay:\n${essayText}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude did not return a text response');
    }

    let parsed: Omit<WritingEvaluationResult, 'evaluator'>;
    try {
      parsed = JSON.parse(textBlock.text) as Omit<
        WritingEvaluationResult,
        'evaluator'
      >;
    } catch (err) {
      this.logger.error(
        `Failed to parse Claude evaluation response: ${textBlock.text}`,
      );
      throw err;
    }

    return { ...parsed, evaluator: 'claude' };
  }
}
