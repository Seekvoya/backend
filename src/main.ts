import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

import * as dotenv from 'dotenv'; dotenv.config();

async function bootstrap() {
  // 1. Загружаем SSL-сертификаты
  const httpsOptions: HttpsOptions = {
    key: readFileSync(join(__dirname, '..', 'ssl', 'key.pem')),
    cert: readFileSync(join(__dirname, '..', 'ssl', 'cert.pem')),
    ca: readFileSync(join(__dirname, '..', 'ssl', 'chain.pem')),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Устанавливаем глобальный префикс 'api' — тогда контроллеры с @Controller('banks') будут доступны по /api/banks
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  const config = new DocumentBuilder()
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Передаём include: [BanksModule] чтобы гарантировать включение endpoints банков в Swagger
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI будет доступен по /api/docs (global prefix + 'docs')
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001, '0.0.0.0');
  console.log(`🚀 Приложение запущено`);
}
bootstrap();