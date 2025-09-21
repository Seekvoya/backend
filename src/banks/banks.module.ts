import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entity/banks.entity';
import { User } from 'src/auth/users.entity';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bank, User])],
  controllers: [BanksController],
  providers: [BanksService],
  exports: [BanksService],
})
export class BanksModule {}