import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum WritingTaskType {
  TASK_1 = 'task_1',
  TASK_2 = 'task_2',
}

@Entity('writing_tasks')
export class WritingTask extends BaseEntity {
  @Column()
  title: string;

  @Column({ name: 'task_type', type: 'enum', enum: WritingTaskType })
  taskType: WritingTaskType;

  @Column({ name: 'prompt_text', type: 'text' })
  promptText: string;

  // For Task 1: a chart/graph/diagram to describe. Null for Task 2.
  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'min_words' })
  minWords: number;

  @Column({ name: 'time_limit_minutes' })
  timeLimitMinutes: number;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;
}
