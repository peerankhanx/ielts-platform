import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'duration_days' })
  durationDays: number;

  // Null = unlimited tests per billing period.
  @Column({ name: 'max_tests', type: 'int', nullable: true })
  maxTests: number | null;

  @Column({ name: 'ai_access', default: true })
  aiAccess: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
