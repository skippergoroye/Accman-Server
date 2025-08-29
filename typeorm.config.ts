import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  ssl: { rejectUnauthorized: false },
  extra: { ssl: { rejectUnauthorized: false } },
  logging: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/**/*{.ts,.js}'],
});


