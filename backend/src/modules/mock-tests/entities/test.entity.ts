import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum ModuleType {
  READING = 'reading',
  LISTENING = 'listening',
  WRITING = 'writing',
  SPEAKING = 'speaking',
  FULL_MOCK = 'full_mock',
}

export enum TestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('tests')
export class Test extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'module_type', type: 'enum', enum: ModuleType })
  moduleType: ModuleType;

  @Column({
    type: 'enum',
    enum: TestDifficulty,
    default: TestDifficulty.MEDIUM,
  })
  difficulty: TestDifficulty;

  @Column({ name: 'time_limit_minutes', default: 60 })
  timeLimitMinutes: number;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;
}
