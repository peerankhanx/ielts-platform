import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from './user.entity';

export enum RoleName {
  STUDENT = 'student',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  CONTENT_MANAGER = 'content_manager',
  SUPPORT_STAFF = 'support_staff',
}

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name: RoleName;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
