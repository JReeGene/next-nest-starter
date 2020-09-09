import { ConfigModule, ConfigService } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TOKEN_TTL } from './tokens.constants';
import TokensController from './tokens.controller';
import TokensService from './tokens.service';
import UsersModule from '../users/users.module';

@Module({
  controllers: [TokensController],
  exports: [TokensService],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        signOptions: {
          expiresIn: TOKEN_TTL,
        },
        secret: configService.get('JWT_SECRET'),
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [TokensService],
})
export default class TokensModule {}
