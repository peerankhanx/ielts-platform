import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WritingTask } from './writing-task.entity';
import { WritingEvaluation } from './writing-evaluation.entity';

export enum SubmissionStatus {
  IN_PROGRESS = 'in_progress',
  EVALUATING = 'evaluating',
  EVALUATED = 'evaluated',
}

@Entity('writing_submissions')
export class WritingSubmission extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => WritingTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: WritingTask;

  @Column({ name: 'essay_text', type: 'text', default: '' })
  essayText: string;

  @Column({ name: 'word_count', default: 0 })
  wordCount: number;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.IN_PROGRESS,
  })
  status: SubmissionStatus;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @OneToOne(() => WritingEvaluation, (evaluation) => evaluation.submission)
  evaluation: WritingEvaluation;
}
