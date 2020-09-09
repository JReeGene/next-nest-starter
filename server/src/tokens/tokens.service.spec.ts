import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import TokensService from './tokens.service';
import User from '../users/user.entity';
import UsersService from '../users/users.service';

describe('TokensService', () => {
  let service: TokensService;
  const jwtService = {
    signAsync: async (payload: unknown) => payload,
    verifyAsync: async (token: unknown) => token,
  };
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
  const usersService = {
    findByEmail: async (email: string) => {
      if (email !== 'hello@alexgrover.me') return null;
      return user;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, TokensService, UsersService],
    })
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    service = module.get<TokensService>(TokensService);
  });

  describe('#validateUser', () => {
    it('validates a user based on email and password', async () => {
      expect(
        await service.validateUser('wrong@alexgrover.me', 'password'),
      ).toBeNull();
      expect(
        await service.validateUser('hello@alexgrover.me', 'wrong'),
      ).toBeNull();
      expect(
        await service.validateUser('hello@alexgrover.me', 'password'),
      ).toEqual(user);
    });
  });

  describe('#createToken', () => {
    it('creates a token', async () => {
      expect(await service.createToken(user)).toEqual({ sub: 1 });
    });
  });

  describe('#verifyToken', () => {
    it('verifies a token', async () => {
      expect(await service.verifyToken('test')).toEqual('test');
    });
  });
});
