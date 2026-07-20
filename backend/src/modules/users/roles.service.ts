import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleName } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  // Ensures the fixed set of platform roles always exists — application
  // code never creates or deletes roles at runtime, only references them.
  async onModuleInit() {
    const defaults: { name: RoleName; description: string }[] = [
      {
        name: RoleName.STUDENT,
        description: 'Learner using the platform to prepare for IELTS',
      },
      {
        name: RoleName.ADMIN,
        description: 'Manages content, students, and day-to-day operations',
      },
      {
        name: RoleName.SUPER_ADMIN,
        description: 'Full platform governance and infrastructure access',
      },
      {
        name: RoleName.CONTENT_MANAGER,
        description: 'Manages test content and the book library',
      },
      {
        name: RoleName.SUPPORT_STAFF,
        description: 'Handles support tickets and student assistance',
      },
    ];

    for (const role of defaults) {
      const existing = await this.rolesRepo.findOne({
        where: { name: role.name },
      });
      if (!existing) {
        await this.rolesRepo.save(this.rolesRepo.create(role));
      }
    }
  }

  findByName(name: RoleName): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }
}
