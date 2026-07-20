import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { SpeakingPart } from './speaking-part.entity';

@Entity('speaking_tasks')
export class SpeakingTask extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @OneToMany(() => SpeakingPart, (part) => part.task)
  parts: SpeakingPart[];
}
