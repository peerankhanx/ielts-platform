import { Injectable } from '@nestjs/common';
import type {
  SpeakingEvaluator,
  SpeakingEvaluationResult,
  SpeakingResponseInput,
} from './speaking-evaluator.interface';

function clampBand(value: number): number {
  const clamped = Math.min(9, Math.max(2, value));
  return Math.round(clamped * 2) / 2;
}

/**
 * Scores Fluency & Coherence directly from the audio signal (speaking-time
 * ratio and pause frequency — both genuinely measured via ffmpeg, see
 * utils/audio-analysis.util.ts). This is a legitimate way to assess fluency
 * without a transcript, since fluency is fundamentally about pacing and
 * hesitation, not word choice.
 *
 * Lexical Resource, Grammatical Range, and Pronunciation are NOT scored here
 * and are returned as `null`. Assessing them honestly requires either a
 * transcript (for lexical/grammar — via speech-to-text, which this
 * environment has no service for) or phoneme-level audio analysis (for
 * pronunciation, a specialized model this environment doesn't have either).
 * Returning fabricated numbers for those would be worse than returning
 * nothing. See the module README for what a real deployment needs to add.
 */
@Injectable()
export class AudioFluencyEvaluator implements SpeakingEvaluator {
  evaluate(
    responses: SpeakingResponseInput[],
  ): Promise<SpeakingEvaluationResult> {
    const totalDuration = responses.reduce(
      (sum, r) => sum + r.durationSeconds,
      0,
    );
    const totalSilence = responses.reduce(
      (sum, r) => sum + r.silenceSeconds,
      0,
    );
    const totalPauses = responses.reduce((sum, r) => sum + r.pauseCount, 0);

    const speakingRatio =
      totalDuration > 0 ? 1 - totalSilence / totalDuration : 0;
    const pausesPerMinute =
      totalDuration > 0 ? totalPauses / (totalDuration / 60) : 0;

    let fluencyCoherence: number;
    if (speakingRatio >= 0.85 && pausesPerMinute <= 4) fluencyCoherence = 7.5;
    else if (speakingRatio >= 0.75 && pausesPerMinute <= 7)
      fluencyCoherence = 7.0;
    else if (speakingRatio >= 0.65 && pausesPerMinute <= 10)
      fluencyCoherence = 6.0;
    else if (speakingRatio >= 0.5) fluencyCoherence = 5.0;
    else fluencyCoherence = 4.0;
    fluencyCoherence = clampBand(fluencyCoherence);

    const underTime = responses.filter(
      (r) => r.durationSeconds < r.expectedSeconds * 0.5,
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (speakingRatio >= 0.8)
      strengths.push(
        'Maintained a steady flow of speech with few long pauses.',
      );
    else {
      weaknesses.push(
        'Noticeable pauses and hesitation throughout the response(s).',
      );
      suggestions.push(
        'Practice speaking continuously on a topic for 1-2 minutes without stopping to plan ahead.',
      );
    }

    if (pausesPerMinute > 8) {
      weaknesses.push(
        `Frequent short pauses (about ${pausesPerMinute.toFixed(1)} per minute).`,
      );
      suggestions.push(
        'Use filler phrases like "let me think about that" instead of silent pauses while gathering ideas.',
      );
    }

    if (underTime.length > 0) {
      weaknesses.push(
        `Part ${underTime.map((r) => r.partNumber).join(', ')} response was notably shorter than expected.`,
      );
      suggestions.push(
        'Aim to use the full available time — extend answers with examples and explanations.',
      );
    } else {
      strengths.push('Used the available speaking time well across parts.');
    }

    return Promise.resolve({
      fluencyCoherence,
      lexicalResource: null,
      grammaticalRange: null,
      pronunciation: null,
      overallBand: null,
      feedback: { strengths, weaknesses, suggestions },
      evaluator: 'audio-heuristic',
    });
  }
}
