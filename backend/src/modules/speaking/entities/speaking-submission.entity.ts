import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { SpeakingTask } from './speaking-task.entity';
import { SpeakingResponse } from './speaking-response.entity';
import { SpeakingEvaluation } from './speaking-evaluation.entity';

export enum SpeakingSubmissionStatus {
  IN_PROGRESS = 'in_progress',
  EVALUATING = 'evaluating',
  EVALUATED = 'evaluated',
}

@Entity('speaking_submissions')
export class SpeakingSubmission extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => SpeakingTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: SpeakingTask;

  @Column({
    type: 'enum',
    enum: SpeakingSubmissionStatus,
    default: SpeakingSubmissionStatus.IN_PROGRESS,
  })
  status: SpeakingSubmissionStatus;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @OneToMany(() => SpeakingResponse, (response) => response.submission)
  responses: SpeakingResponse[];

  @OneToOne(() => SpeakingEvaluation, (evaluation) => evaluation.submission)
  evaluation: SpeakingEvaluation;
}
