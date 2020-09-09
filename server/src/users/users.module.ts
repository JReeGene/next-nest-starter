import { ConfigModule } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import TokensModule from '../tokens/tokens.module';
import User from './user.entity';
import UsersController from './users.controller';
import UsersRepository from './users.repository';
import UsersService from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    ConfigModule,
    forwardRef(() => TokensModule),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UsersRepository]),
  ],
  providers: [UsersService],
})
export default class UsersModule {}
