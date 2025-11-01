import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Servir les fichiers statiques depuis le dossier uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/uploads/previews', express.static(join(process.cwd(), 'previews')));


  await app.listen(process.env.PORT || 3001);
}
bootstrap();