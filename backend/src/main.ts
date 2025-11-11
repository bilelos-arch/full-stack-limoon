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
      'http://localhost:3000',                      // pour tests locaux
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });


  // Servir les fichiers statiques depuis le dossier uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/uploads/previews', express.static(join(process.cwd(), 'uploads/previews')));
  app.use('/uploads/temp-previews', express.static(join(process.cwd(), 'uploads/temp-previews')));
  app.use('/uploads/temp-images', express.static(join(process.cwd(), 'uploads/temp-images')));
  app.use('/uploads/pdfs', express.static(join(process.cwd(), 'uploads/pdfs')));

  // Servir les fichiers temporaires de prévisualisation
  app.use('/temp-previews', express.static(join(process.cwd(), 'uploads/temp-previews')));

  // Configure body-parser limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT || 10000);
}
bootstrap();