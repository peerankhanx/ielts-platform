import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Immutable audit trail for security-relevant events (logins, failed logins,
 * password changes, role changes, admin actions...). Records are never
 * updated or deleted by application code.
 */
@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId: string | null;

  @Column()
  action: string;

  @Column({ nullable: true })
  module: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
