import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import TokensService, { JwtPayload } from './tokens.service';
import UsersService from '../users/users.service';

@Injectable()
export default class TokenGuard implements CanActivate {
  constructor(
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.signedCookies?.token;
    if (!token) throw new UnauthorizedException();

    const { sub: userId }: JwtPayload = await this.tokensService.verifyToken(
      token,
    );
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    request.user = user;
    return true;
  }
}
