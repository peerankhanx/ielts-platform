import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';

export enum PreferredTestType {
  ACADEMIC = 'academic',
  GENERAL = 'general',
}

@Entity('student_profiles')
export class StudentProfile extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.studentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  country: string;

  @Column({
    name: 'target_band',
    type: 'decimal',
    precision: 2,
    scale: 1,
    default: 7.0,
  })
  targetBand: number;

  @Column({
    name: 'current_band',
    type: 'decimal',
    precision: 2,
    scale: 1,
    default: 0,
  })
  currentBand: number;

  @Column({ name: 'study_goal', nullable: true, type: 'text' })
  studyGoal: string;

  @Column({
    name: 'preferred_test_type',
    type: 'enum',
    enum: PreferredTestType,
    default: PreferredTestType.ACADEMIC,
  })
  preferredTestType: PreferredTestType;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ name: 'exam_date', type: 'date', nullable: true })
  examDate: Date | null;
}
