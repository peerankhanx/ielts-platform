import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TestAttempt } from './test-attempt.entity';
import { Question } from './question.entity';

@Entity('answers')
@Index(['attemptId', 'questionId'], { unique: true })
export class Answer extends BaseEntity {
  @Column({ name: 'attempt_id' })
  attemptId: string;

  @ManyToOne(() => TestAttempt, (attempt) => attempt.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attempt_id' })
  attempt: TestAttempt;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  // Free-form so it fits any question type: a string for MCQ/TFNG/short-answer.
  @Column({ name: 'response_value', type: 'jsonb', nullable: true })
  responseValue: string | null;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ name: 'points_awarded', type: 'int', nullable: true })
  pointsAwarded: number | null;
}
