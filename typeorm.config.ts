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


// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// export default TypeOrmModule.forRootAsync({
//   imports: [ConfigModule],
//   useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
//     type: 'postgres',
//     url: configService.get<string>('DATABASE_URL'),
//     autoLoadEntities: true,
//     synchronize: false,
//     ssl: { rejectUnauthorized: false },
//     extra: { ssl: { rejectUnauthorized: false } },
//     logging: true,
//   }),
//   inject: [ConfigService],
// });