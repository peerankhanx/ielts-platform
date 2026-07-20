import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export interface SpeakingTextEvaluationResult {
  lexicalResource: number;
  grammaticalRange: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const SYSTEM_PROMPT = `You are an IELTS Speaking examiner. You are given a transcript of a candidate's
spoken responses (transcribed by speech-to-text, so treat minor transcription artifacts leniently).
Score ONLY Lexical Resource and Grammatical Range & Accuracy, 0-9 in 0.5 increments, per the official
IELTS Speaking band descriptors. Do NOT attempt to score Fluency & Coherence or Pronunciation — those
are assessed separately from the audio itself, not from this transcript.

Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "lexicalResource": number,
  "grammaticalRange": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}`;

/**
 * Only runs when a transcript actually exists (i.e. OpenAIWhisperProvider
 * produced one) and ANTHROPIC_API_KEY is set. Deliberately scores just two
 * of the four Speaking criteria — the two that a transcript can genuinely
 * support. Fluency & Coherence stays with AudioFluencyEvaluator (needs the
 * audio's timing, not the words), and Pronunciation is left unscored
 * entirely since neither this nor any other piece of this project assesses
 * phonemes. See speaking.service.ts for how these are combined.
 */
@Injectable()
export class ClaudeSpeakingTextEvaluator {
  private readonly logger = new Logger(ClaudeSpeakingTextEvaluator.name);
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }

  async evaluate(
    taskTitle: string,
    transcript: string,
  ): Promise<SpeakingTextEvaluationResult | null> {
    try {
      const message = await this.getClient().messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Speaking task: ${taskTitle}\n\nTranscript of the candidate's responses:\n${transcript}`,
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return null;

      return JSON.parse(textBlock.text) as SpeakingTextEvaluationResult;
    } catch (err) {
      this.logger.error(
        `Speaking text evaluation failed: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
