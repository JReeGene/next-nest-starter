import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import TokensController from './tokens.controller';
import TokenGuard from './token.guard';
import TokensService from './tokens.service';
import User from '../users/user.entity';

describe('TokensController', () => {
  let controller: TokensController;
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
  const configService = {
    get: () => 'not production',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [TokensService, ConfigService],
    })
      .overrideGuard(TokenGuard)
      .useValue(tokenGuard)
      .overrideProvider(TokensService)
      .useValue(tokensService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    controller = module.get<TokensController>(TokensController);
  });

  describe('#create', () => {
    it('generates token on login', async () => {
      const request = { _cookies: [] };
      expect(
        await controller.create(request, {
          email: 'email',
          password: 'password',
        }),
      ).toEqual({
        id: 123,
      });
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
  });

  describe('#delete', () => {
    it('logs out', async () => {
      expect(await controller.delete()).toBeNull();
    });
  });
});
