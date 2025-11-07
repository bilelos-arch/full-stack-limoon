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
    origin: [
      'https://full-stack-limoon-t4jt.vercel.app', // ton frontend
      'http://localhost:3000',                      // pour tests locaux
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });


  // Servir les fichiers statiques depuis le dossier uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/uploads/previews', express.static(join(process.cwd(), 'uploads/previews')));
  app.use('/uploads/temp-previews', express.static(join(process.cwd(), 'uploads/temp-previews')));

  // Servir les fichiers temporaires de prévisualisation
  app.use('/temp-previews', express.static(join(process.cwd(), 'uploads/temp-previews')));


  await app.listen(process.env.PORT || 3001);
}
bootstrap();