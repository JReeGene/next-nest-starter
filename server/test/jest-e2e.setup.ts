import { createConnection, getRepository } from 'typeorm';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

dotenvExpand(dotenv.config());

beforeEach(async () => {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['<rootDir>/../src/**/*.entity.ts'],
  });

  const repositories = connection.entityMetadatas.map(entityMetadata => {
    return getRepository(entityMetadata.name);
  });

  for (const repository of repositories) {
    await repository.clear();
  }

  return connection.close();
});
