import { Injectable } from '@nestjs/common';
import type {
  WritingEvaluator,
  WritingEvaluationResult,
} from './writing-evaluator.interface';

const LINKING_WORDS = [
  'however',
  'therefore',
  'moreover',
  'furthermore',
  'in addition',
  'in contrast',
  'on the other hand',
  'as a result',
  'consequently',
  'for example',
  'for instance',
  'in conclusion',
  'to conclude',
  'nevertheless',
  'although',
  'despite',
  'while',
  'whereas',
  'in summary',
  'overall',
];

function clampBand(value: number): number {
  const clamped = Math.min(9, Math.max(2, value));
  return Math.round(clamped * 2) / 2; // round to nearest 0.5
}

/**
 * A genuine, rule-based first-pass evaluator — not an LLM. It measures
 * signals that correlate loosely with the four IELTS writing criteria
 * (length vs. task requirement, lexical diversity, sentence complexity,
 * use of cohesive devices) and turns them into band estimates.
 *
 * This is deliberately transparent about being a heuristic rather than a
 * genuine assessment of meaning, argument quality, or task relevance — all
 * things only a human examiner or a real LLM evaluation can judge. It exists
 * so the full submit → evaluate → display pipeline works end-to-end without
 * requiring an API key, and so there's a graceful fallback if the Claude
 * evaluator (see claude-writing-evaluator.ts) is ever unavailable.
 */
@Injectable()
export class HeuristicWritingEvaluator implements WritingEvaluator {
  evaluate({
    essayText,
    minWords,
  }: {
    promptText: string;
    essayText: string;
    minWords: number;
  }): Promise<WritingEvaluationResult> {
    const words = essayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const sentences = essayText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const avgSentenceLength =
      sentences.length > 0 ? wordCount / sentences.length : 0;

    const uniqueWords = new Set(
      words.map((w) => w.toLowerCase().replace(/[^a-z']/g, '')),
    ).size;
    const typeTokenRatio = wordCount > 0 ? uniqueWords / wordCount : 0;

    const lowerEssay = essayText.toLowerCase();
    const linkingWordHits = LINKING_WORDS.filter((phrase) =>
      lowerEssay.includes(phrase),
    ).length;

    // --- Task Achievement: primarily a length signal (does it meet the
    // minimum word count with some margin, without being wildly short) ---
    const lengthRatio = minWords > 0 ? wordCount / minWords : 1;
    let taskAchievement: number;
    if (lengthRatio >= 1.1) taskAchievement = 7.5;
    else if (lengthRatio >= 1.0) taskAchievement = 7.0;
    else if (lengthRatio >= 0.85) taskAchievement = 6.0;
    else if (lengthRatio >= 0.6) taskAchievement = 5.0;
    else taskAchievement = 3.5;

    // --- Coherence & Cohesion: presence of linking/cohesive devices ---
    let coherenceCohesion: number;
    if (linkingWordHits >= 5) coherenceCohesion = 7.5;
    else if (linkingWordHits >= 3) coherenceCohesion = 7.0;
    else if (linkingWordHits >= 1) coherenceCohesion = 6.0;
    else coherenceCohesion = 5.0;

    // --- Lexical Resource: vocabulary diversity via type-token ratio ---
    let lexicalResource: number;
    if (typeTokenRatio >= 0.6) lexicalResource = 8.0;
    else if (typeTokenRatio >= 0.5) lexicalResource = 7.0;
    else if (typeTokenRatio >= 0.4) lexicalResource = 6.0;
    else lexicalResource = 5.0;

    // --- Grammatical Range: average sentence length as a rough complexity
    // proxy (very short sentences throughout suggest simple structures;
    // extremely long ones often signal run-ons rather than real complexity) ---
    let grammaticalRange: number;
    if (avgSentenceLength >= 14 && avgSentenceLength <= 24)
      grammaticalRange = 7.0;
    else if (avgSentenceLength >= 10) grammaticalRange = 6.0;
    else grammaticalRange = 5.0;

    taskAchievement = clampBand(taskAchievement);
    coherenceCohesion = clampBand(coherenceCohesion);
    lexicalResource = clampBand(lexicalResource);
    grammaticalRange = clampBand(grammaticalRange);

    const overallBand = clampBand(
      (taskAchievement +
        coherenceCohesion +
        lexicalResource +
        grammaticalRange) /
        4,
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (lengthRatio >= 1.0)
      strengths.push(
        `Meets the ${minWords}-word requirement (${wordCount} words written).`,
      );
    else
      weaknesses.push(
        `Falls short of the ${minWords}-word minimum (${wordCount} words written).`,
      );

    if (linkingWordHits >= 3)
      strengths.push('Uses a good range of linking words to connect ideas.');
    else {
      weaknesses.push(
        'Limited use of linking words between ideas and paragraphs.',
      );
      suggestions.push(
        'Try connectors like "however", "moreover", or "as a result" to link your points.',
      );
    }

    if (typeTokenRatio >= 0.5)
      strengths.push(
        'Shows a varied vocabulary rather than repeating the same words.',
      );
    else {
      weaknesses.push('Vocabulary is somewhat repetitive.');
      suggestions.push(
        'Vary your word choice — avoid repeating the same key terms throughout.',
      );
    }

    if (avgSentenceLength < 10) {
      weaknesses.push('Sentences are mostly short and simple.');
      suggestions.push(
        'Combine some short sentences using conjunctions or relative clauses for more range.',
      );
    } else if (avgSentenceLength > 28) {
      weaknesses.push(
        'Some sentences may be overly long, risking run-on structures.',
      );
      suggestions.push(
        'Break up very long sentences to keep grammar clear and controlled.',
      );
    } else {
      strengths.push(
        'Sentence length suggests a reasonable mix of simple and complex structures.',
      );
    }

    return Promise.resolve({
      taskAchievement,
      coherenceCohesion,
      lexicalResource,
      grammaticalRange,
      overallBand,
      feedback: { strengths, weaknesses, suggestions },
      evaluator: 'heuristic',
    });
  }
}
