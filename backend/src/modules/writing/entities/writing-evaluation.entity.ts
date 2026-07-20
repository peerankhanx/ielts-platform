import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { WritingSubmission } from './writing-submission.entity';

@Entity('writing_evaluations')
export class WritingEvaluation extends BaseEntity {
  @Column({ name: 'submission_id', unique: true })
  submissionId: string;

  @OneToOne(() => WritingSubmission, (submission) => submission.evaluation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: WritingSubmission;

  @Column({ name: 'task_achievement', type: 'decimal', precision: 2, scale: 1 })
  taskAchievement: number;

  @Column({
    name: 'coherence_cohesion',
    type: 'decimal',
    precision: 2,
    scale: 1,
  })
  coherenceCohesion: number;

  @Column({ name: 'lexical_resource', type: 'decimal', precision: 2, scale: 1 })
  lexicalResource: number;

  @Column({
    name: 'grammatical_range',
    type: 'decimal',
    precision: 2,
    scale: 1,
  })
  grammaticalRange: number;

  @Column({ name: 'overall_band', type: 'decimal', precision: 2, scale: 1 })
  overallBand: number;

  @Column({ type: 'jsonb' })
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };

  // Which evaluator produced this: 'heuristic' or 'claude'. Surfaced to the
  // frontend so students/admins know whether it was a full LLM evaluation
  // or the deterministic fallback (see evaluators/ for both implementations).
  @Column({ name: 'evaluator', default: 'heuristic' })
  evaluator: string;
}
