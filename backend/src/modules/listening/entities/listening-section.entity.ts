import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Test } from '../../mock-tests/entities/test.entity';
import { Question } from '../../reading/entities/question.entity';

@Entity('listening_sections')
export class ListeningSection extends BaseEntity {
  @Column({ name: 'test_id' })
  testId: string;

  @ManyToOne(() => Test, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'order_index', default: 1 })
  orderIndex: number;

  @Column()
  title: string;

  // Relative path served by GET /api/v1/listening/audio/:filename
  @Column({ name: 'audio_url' })
  audioUrl: string;

  @Column({ name: 'duration_seconds', default: 0 })
  durationSeconds: number;

  @Column({ nullable: true, type: 'text' })
  transcript: string;

  @OneToMany(() => Question, (question) => question.section)
  questions: Question[];
}
