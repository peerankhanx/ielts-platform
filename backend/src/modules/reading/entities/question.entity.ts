import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Test } from '../../mock-tests/entities/test.entity';
import { ReadingPassage } from './reading-passage.entity';
import { ListeningSection } from '../../listening/entities/listening-section.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
  SHORT_ANSWER = 'short_answer',
  MATCHING_HEADING = 'matching_heading',
}

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ name: 'test_id' })
  testId: string;

  @ManyToOne(() => Test, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column({ name: 'passage_id', nullable: true })
  passageId: string | null;

  @ManyToOne(() => ReadingPassage, (passage) => passage.questions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'passage_id' })
  passage: ReadingPassage | null;

  @Column({ name: 'section_id', nullable: true })
  sectionId: string | null;

  @ManyToOne(() => ListeningSection, (section) => section.questions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'section_id' })
  section: ListeningSection | null;

  @Column({ name: 'order_index', default: 1 })
  orderIndex: number;

  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;

  @Column({ name: 'prompt_text', type: 'text' })
  promptText: string;

  // MULTIPLE_CHOICE: string[] of options. MATCHING_HEADING: string[] of headings.
  // Null for SHORT_ANSWER / TRUE_FALSE_NOT_GIVEN (fixed TFNG options are implicit).
  @Column({ type: 'jsonb', nullable: true })
  options: string[] | null;

  // MULTIPLE_CHOICE/TFNG/MATCHING_HEADING: a single string.
  // SHORT_ANSWER: string[] of acceptable answers (case-insensitive match against any).
  @Column({ name: 'correct_answer', type: 'jsonb' })
  correctAnswer: string | string[];

  @Column({ default: 1 })
  points: number;

  @Column({ nullable: true, type: 'text' })
  explanation: string;
}
