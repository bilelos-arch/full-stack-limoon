import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { TemplatesModule } from './templates.module';
import { HistoiresModule } from './histoires/histoires.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://bilelos00:Kaspersky002@myapp.h9fam1j.mongodb.net/'),
    AuthModule,
    UsersModule,
    TemplatesModule,
    HistoiresModule,
  ],
})
export class AppModule {}