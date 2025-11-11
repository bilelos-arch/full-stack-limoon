import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { TemplatesModule } from './templates.module';
import { HistoiresModule } from './histoires/histoires.module';
import { AdminController } from './admin.controller';
import { Histoire, HistoireSchema } from './histoires/schemas/histoire.schema';
import { User, UserSchema } from './user.schema';
import { Template, TemplateSchema } from './template.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://bilelos00:Kaspersky002@myapp.h9fam1j.mongodb.net/'),
    MongooseModule.forFeature([
      { name: Histoire.name, schema: HistoireSchema },
      { name: User.name, schema: UserSchema },
      { name: Template.name, schema: TemplateSchema }
    ]),
    AuthModule,
    UsersModule,
    TemplatesModule,
    HistoiresModule,
  ],
  controllers: [AdminController],
})
export class AppModule {}