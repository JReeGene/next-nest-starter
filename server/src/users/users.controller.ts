import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieSettings, SetCookies } from '@nestjsplus/cookies';
import ms from 'ms';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { TOKEN_TTL } from '../tokens/tokens.constants';
import TokenGuard from '../tokens/token.guard';
import TokensService from '../tokens/tokens.service';
import User from './user.entity';
import UsersService from './users.service';

@Controller('users')
export default class UsersController {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
  ) {}

  @SetCookies()
  @Post()
  async create(
    @Request() request: { _cookies: CookieSettings[] },
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    let user;
    try {
      user = await this.usersService.create(createUserDto);
    } catch (error) {
      throw new ConflictException(error.message);
    }

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
  @Get('me')
  async me(@Request() request: { user: User }): Promise<User> {
    return request.user;
  }

  @UseGuards(TokenGuard)
  @Put(':id')
  async update(
    @Request() request: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (request.user.id !== id)
      throw new UnauthorizedException('Cannot edit another user');

    let user: User;
    try {
      user = await this.usersService.update(request.user.id, updateUserDto);
    } catch (error) {
      throw new ConflictException(error.message);
    }

    return user;
  }
}
