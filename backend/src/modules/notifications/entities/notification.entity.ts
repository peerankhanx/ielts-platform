import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  AI_EVALUATION = 'ai_evaluation',
  SUBSCRIPTION = 'subscription',
  TEST = 'test',
  ACHIEVEMENT = 'achievement',
  REMINDER = 'reminder',
  PAYMENT = 'payment',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;
}
