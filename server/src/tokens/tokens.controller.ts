import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClearCookies, CookieSettings, SetCookies } from '@nestjsplus/cookies';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import CreateTokenDto from './tokens.dto';
import { TOKEN_TTL } from './tokens.constants';
import TokenGuard from './token.guard';
import TokensService from './tokens.service';
import User from '../users/user.entity';

@Controller('tokens')
export default class TokensController {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
  ) {}

  @SetCookies()
  @Post()
  async create(
    @Request() request: { _cookies: CookieSettings[] },
    @Body() loginDto: CreateTokenDto,
  ): Promise<User> {
    const user = await this.tokensService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException();

    const token = await this.tokensService.createToken(user);
    request._cookies = [
      {
        name: 'token',
        value: token,
        options: {
          httpOnly: true,
          maxAge: ms(TOKEN_TTL),
          sameSite: 'strict',
          secure: this.configService.get('NODE_ENV') === 'production',
          signed: true,
        },
      },
    ];

    return user;
  }

  @UseGuards(TokenGuard)
  @ClearCookies('token')
  @Delete()
  @HttpCode(204)
  delete(): null {
    return null;
  }
}
