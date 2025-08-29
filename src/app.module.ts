// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { AccountsModule } from './accounts/accounts.module';
// import { AdminModule } from './admin/admin.module';
// import { TransactionsModule } from './transactions/transactions.module';
// import { EmailModule } from './email/email.module';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { User } from './auth/entities/user.entity';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true, // Makes the configuration available globally
//       envFilePath: '.env', // Path to the environment variables file
//     }),

//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
//         type: 'postgres',
//         host: configService.get<string>('DB_HOST'),
//         port: configService.get<number>('DB_PORT'),
//         username: configService.get<string>('DB_USERNAME'),
//         password: configService.get<string>('DB_PASSWORD'),
//         database: configService.get<string>('DB_DATABASE'),
//         entities: [User],
//         // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//         synchronize: false,
//         logging: true,
//       }),
//       inject: [ConfigService],
//     }),
//     AuthModule,
//     UsersModule,
//     AccountsModule,
//     AdminModule,
//     TransactionsModule,
//     EmailModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { AdminModule } from './admin/admin.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { dataSourceOptions } from 'db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeOrmModule.forRoot(dataSourceOptions),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } },
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    AdminModule,
    TransactionsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
