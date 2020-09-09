import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import User from './user.entity';
import UsersRepository from './users.repository';
import { QueryFailedError } from 'typeorm';

@Injectable()
export default class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userToCreate } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.usersRepository.create({
      ...userToCreate,
      hashedPassword,
    });
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new Error('Email is already in use');
      }
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, ...editedUser } = updateUserDto;
    const user = this.usersRepository.create({ id, ...editedUser });

    if (password) {
      const salt = await bcrypt.genSalt();
      user.hashedPassword = await bcrypt.hash(password, salt);
    }

    try {
      await this.usersRepository
        .createQueryBuilder()
        .update(user)
        .whereEntity(user)
        .returning('*')
        .execute();
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new Error('Email is already in use');
      }
      throw error;
    }

    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
