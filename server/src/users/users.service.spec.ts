import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import User from './user.entity';
import UsersService from './users.service';
import { QueryFailedError } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
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
  const usersRepository = {
    create: (user: User) => user,
    createQueryBuilder: jest.fn(() => ({
      update: (user: User) => {
        if (user.firstName === 'throw on update')
          throw new QueryFailedError('', undefined, '');
        return {
          whereEntity: () => ({
            returning: () => ({
              execute: jest.fn(),
            }),
          }),
        };
      },
    })),
    findOne: async (
      query: number | { where: { email: string } },
    ): Promise<User | undefined> => {
      if (typeof query === 'number' && query === 1) {
        return user;
      } else if (
        typeof query === 'object' &&
        query.where.email === 'hello@alexgrover.me'
      ) {
        return user;
      }
    },
    save: (user: User) => {
      if (user.firstName === 'throw on create')
        throw new QueryFailedError('', undefined, '');
      return user;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('#create', () => {
    it('creates a user', async () => {
      const userParams = {
        firstName: 'alex',
        lastName: 'grover',
        email: 'hello@alexgrover.me',
      };
      expect(
        await service.create({
          ...userParams,
          password: 'password',
        }),
      ).toMatchObject({
        ...userParams,
        hashedPassword: expect.stringContaining(''),
      });
    });

    it('throws an error if email is in use', async () => {
      const userParams = {
        firstName: 'throw on create',
        lastName: 'grover',
        email: 'hello@alexgrover.me',
        password: 'password',
      };
      await expect(service.create(userParams)).rejects.toThrow(
        'Email is already in use',
      );
    });
  });

  describe('#update', () => {
    it('updates a user', async () => {
      const userParams = {
        firstName: 'alex',
        lastName: 'grover',
        email: 'hello@alexgrover.me',
      };
      expect(
        await service.update(1, { ...userParams, password: 'password' }),
      ).toMatchObject({
        ...userParams,
        id: 1,
        hashedPassword: expect.stringContaining(''),
      });
    });

    it('throws an error if email is in use', async () => {
      const updateParams = {
        firstName: 'throw on update',
        lastName: 'grover',
        email: 'hello@alexgrover.me',
        password: 'password',
      };
      await expect(service.update(1, updateParams)).rejects.toThrow(
        'Email is already in use',
      );
    });
  });

  describe('#findById', () => {
    it('finds a user by ID', async () => {
      expect(await service.findById(-1)).toBeUndefined();
      expect(await service.findById(1)).toEqual(user);
    });
  });

  describe('#findByEmail', () => {
    it('finds a user by email', async () => {
      expect(await service.findByEmail('wrong@alexgrover.me')).toBeUndefined();
      expect(await service.findByEmail('hello@alexgrover.me')).toEqual(user);
    });
  });
});
