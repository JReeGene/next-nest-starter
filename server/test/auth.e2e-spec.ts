import { ConfigModule, ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';
import Joi from 'joi';
import supertest from 'supertest';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import TokensModule from '../src/tokens/tokens.module';
import UsersModule from '../src/users/users.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    app = module.createNestApplication();
    const configService = app.get('ConfigService');
    app.use(cookieParser(configService.get('COOKIE_SECRET')));
    await app.init();
  });

  it('registers and logs in a user', async () => {
    const agent = supertest.agent(app.getHttpServer());
    const userParams = {
      firstName: 'alex',
      lastName: 'grover',
      email: 'hello@alexgrover.me',
    };

    // Register
    const registerResponse = await agent
      .post('/users')
      .send({
        ...userParams,
        password: 'password',
      })
      .expect(201);

    expect(registerResponse.body).toMatchObject(userParams);

    // Send a request to a JWT-protected endpoint
    const registeredUserResponse = await agent.get('/users/me').expect(200);

    expect(registeredUserResponse.body).toMatchObject(userParams);

    // Log out
    await agent.delete('/tokens').expect(204);

    // Sending a request to a JWT-protected endpoint errors
    await agent.get('/users/me').expect(401);

    // Log in
    const loginResponse = await agent
      .post('/tokens')
      .send({ email: 'hello@alexgrover.me', password: 'password' })
      .expect(201);

    expect(loginResponse.body).toMatchObject(userParams);

    // Send a request to a JWT-protected endpoint
    const loggedInUserResponse = await agent.get('/users/me').expect(200);

    expect(loggedInUserResponse.body).toMatchObject(userParams);
  });

  afterAll(async () => {
    await app.close();
  });
});
