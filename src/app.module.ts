import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/users.entity';
import { History } from './history/history.entity';
import { Bank } from './banks/entity/banks.entity';
import { BanksModule } from './banks/banks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      // type: 'mysql',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      // port: 3306,
      // username: 'u3215840_default',
      username: 'postgres',
      password: 'root',
      database: 'dest',
      entities: [User, History, Bank],
      autoLoadEntities: true,
      logging: true, 
      retryAttempts: 5,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, History, Bank]),
    AuthModule, BanksModule
  ],
})
export class AppModule {}