import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory, Reflector } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 20, // limit each IP to 20 requests per windowMs
    }),
  );

  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  configService.get('NODE_ENV') === 'development' &&
    app.enableCors({
      credentials: true,
      origin: configService.get('CORS_DOMAIN'),
    });

  app.use(bodyParser.json({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(configService.get('PORT', 3001));
}
bootstrap();
