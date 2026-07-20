import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Test } from '../../mock-tests/entities/test.entity';
import { Question } from './question.entity';

@Entity('reading_passages')
export class ReadingPassage extends BaseEntity {
  @Column({ name: 'test_id' })
  testId: string;

  @ManyToOne(() => Test, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'order_index', default: 1 })
  orderIndex: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'word_count', default: 0 })
  wordCount: number;

  @OneToMany(() => Question, (question) => question.passage)
  questions: Question[];
}
