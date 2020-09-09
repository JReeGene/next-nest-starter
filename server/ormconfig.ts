import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenvExpand(dotenv.config());

export = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  cli: {
    migrationsDir: 'migrations',
  },
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
};
