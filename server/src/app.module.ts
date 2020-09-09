import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { Module } from '@nestjs/common';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import TokensModule from './tokens/tokens.module';
import UsersModule from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      ignoreEnvVars: true,
      validationOptions: {
        abortEarly: false,
        allowUnknown: false,
      },
      validationSchema: Joi.object({
        COOKIE_SECRET: Joi.string().required(),
        CORS_DOMAIN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .required(),
        PORT: Joi.number().required(),
        PROJECT_NAME: Joi.string().required(),
      }),
    }),
    TokensModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
  ],
})
export class AppModule {}
