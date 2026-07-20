import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  // NOTE: synchronize is convenient for early scaffolding but must be
  // replaced with real migrations (see database/migrations/) before any
  // staging or production deployment.
  synchronize: process.env.NODE_ENV !== 'production',
  logging:
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
}));
