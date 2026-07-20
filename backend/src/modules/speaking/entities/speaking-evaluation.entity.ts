import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { SpeakingSubmission } from './speaking-submission.entity';

@Entity('speaking_evaluations')
export class SpeakingEvaluation extends BaseEntity {
  @Column({ name: 'submission_id', unique: true })
  submissionId: string;

  @OneToOne(() => SpeakingSubmission, (submission) => submission.evaluation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: SpeakingSubmission;

  // Genuinely computable from audio alone (pause frequency/duration, speaking
  // rate) — see evaluators/audio-fluency-evaluator.ts.
  @Column({
    name: 'fluency_coherence',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
  })
  fluencyCoherence: number | null;

  // These three require a transcript (word choice, grammar structures,
  // phoneme-level pronunciation analysis) which this environment doesn't
  // have a speech-to-text service available to produce. Left null rather
  // than fabricated — see the module README for what a real deployment needs.
  @Column({
    name: 'lexical_resource',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
  })
  lexicalResource: number | null;

  @Column({
    name: 'grammatical_range',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
  })
  grammaticalRange: number | null;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  pronunciation: number | null;

  @Column({
    name: 'overall_band',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
  })
  overallBand: number | null;

  @Column({ type: 'jsonb' })
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };

  @Column({ default: 'audio-heuristic' })
  evaluator: string;
}
