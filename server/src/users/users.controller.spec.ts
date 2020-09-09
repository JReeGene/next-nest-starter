import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import TokenGuard from '../tokens/token.guard';
import TokensService from '../tokens/tokens.service';
import User from './user.entity';
import UsersController from './users.controller';
import UsersService from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  const user: User = {
    id: 1,
    firstName: 'Alex',
    lastName: 'Grover',
    email: 'hello@alexgrover.me',
    hashedPassword:
      '$2b$10$6naVdu.auRwj4cOS4e6EDOALjmIozMU/UMbk9mXdeVLK5OCGXGlMy',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };
  const configService = {
    get: () => 'not production',
  };
  const tokenGuard = {
    canActivate() {
      return true;
    },
  };
  const tokensService = {
    validateUser: async () => ({ id: 123 } as User),
    createToken: async () => 'test token',
    verifyToken: async () => ({ sub: 456 }),
  };
  const usersService = {
    create: async (createUserDto: CreateUserDto) => {
      if (createUserDto.firstName === 'throw') throw new Error('Email in use');
      return user;
    },
    update: async (id: number, updateUserDto: UpdateUserDto) => {
      if (updateUserDto.firstName === 'throw') throw new Error('Email in use');
      return user;
    },
    findById: async (id: number) => {
      if (id === 1) return user;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [TokensService, ConfigService, UsersService],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideGuard(TokenGuard)
      .useValue(tokenGuard)
      .overrideProvider(TokensService)
      .useValue(tokensService)
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('#create', () => {
    it('creates and logs in a user', async () => {
      const request = { _cookies: [] };
      const createUserDto: CreateUserDto = {
        firstName: 'alex',
        lastName: 'grover',
        email: 'email@example.com',
        password: 'password',
      };
      expect(await controller.create(request, createUserDto)).toEqual(user);

      expect(request._cookies).toContainEqual({
        name: 'token',
        value: 'test token',
        options: {
          httpOnly: true,
          maxAge: 2592000000,
          sameSite: 'strict',
          secure: false,
          signed: true,
        },
      });
    });

    it('throws ConflictException if email is taken', async () => {
      const request = { _cookies: [] };
      const createUserDto: CreateUserDto = {
        firstName: 'throw',
        lastName: 'grover',
        email: 'taken@example.com',
        password: 'password',
      };
      await expect(controller.create(request, createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('#me', () => {
    it('gets own user', async () => {
      expect(await controller.me({ user })).toEqual(user);
    });
  });

  describe('#update', () => {
    it('updates user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'test',
        lastName: 'update',
        email: 'a@new.email',
        password: 'test1234',
      };

      expect(await controller.update({ user }, user.id, updateUserDto)).toEqual(
        user,
      );
    });

    it('throws ConflictException if email is taken', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'throw',
        lastName: 'update',
        email: 'a@taken.email',
        password: 'test1234',
      };

      await expect(
        controller.update({ user }, user.id, updateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('throws UnauthorizedException if not logged in as correct user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'test',
        lastName: 'update',
        email: 'a@new.email',
        password: 'test1234',
      };

      await expect(
        controller.update(
          { user: { ...user, id: 1234 } },
          user.id,
          updateUserDto,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
