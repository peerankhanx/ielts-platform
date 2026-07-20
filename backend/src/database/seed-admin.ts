import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserStatus } from '../modules/users/entities/user.entity';
import { Role, RoleName } from '../modules/users/entities/role.entity';

const ADMIN_EMAIL = 'admin@bandwise.dev';
const ADMIN_PASSWORD = 'AdminPass!23';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const roleRepo = app.get<Repository<Role>>(getRepositoryToken(Role));

  const existing = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
    await app.close();
    return;
  }

  const adminRole = await roleRepo.findOne({
    where: { name: RoleName.SUPER_ADMIN },
  });
  if (!adminRole) {
    console.error(
      'super_admin role not found — start the API once first so roles get seeded.',
    );
    await app.close();
    process.exit(1);
  }

  const passwordHash = await argon2.hash(ADMIN_PASSWORD);
  await userRepo.save(
    userRepo.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    }),
  );

  console.log(
    `Created super_admin account:\n  email: ${ADMIN_EMAIL}\n  password: ${ADMIN_PASSWORD}`,
  );
  console.log('Change this password immediately in any real deployment.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
