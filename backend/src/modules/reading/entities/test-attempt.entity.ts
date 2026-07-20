import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Test } from '../../mock-tests/entities/test.entity';
import { Answer } from './answer.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('test_attempts')
export class TestAttempt extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'test_id' })
  testId: string;

  @ManyToOne(() => Test, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'raw_score', type: 'int', nullable: true })
  rawScore: number | null;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column({
    name: 'band_score',
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
  })
  bandScore: number | null;

  @OneToMany(() => Answer, (answer) => answer.attempt)
  answers: Answer[];
}
