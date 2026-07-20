import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { SpeakingTask } from './speaking-task.entity';

@Entity('speaking_parts')
export class SpeakingPart extends BaseEntity {
  @Column({ name: 'task_id' })
  taskId: string;

  @ManyToOne(() => SpeakingTask, (task) => task.parts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: SpeakingTask;

  @Column({ name: 'part_number' })
  partNumber: number;

  @Column({ name: 'prompt_text', type: 'text' })
  promptText: string;

  // Part 2 cue-card bullet points (e.g. "Describe a place you visited" ->
  // ["Where it is", "When you went", "What you did there", "Why it was memorable"]).
  // Null for Parts 1 and 3, which are conversational Q&A instead.
  @Column({ name: 'cue_card_points', type: 'jsonb', nullable: true })
  cueCardPoints: string[] | null;

  @Column({ name: 'prep_time_seconds', default: 0 })
  prepTimeSeconds: number;

  @Column({ name: 'speak_time_seconds' })
  speakTimeSeconds: number;
}
