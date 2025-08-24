import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppoimentsModule } from './modules/appoiments/appoiments.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailService } from './Email/email.service';
import { EmailModule } from './Email/email.module';
import { AiModule } from './Gemini/ai/ai.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    PatientModule,
    DoctorsModule,
    AppoimentsModule,
    AdminModule,
    EmailModule,
    AiModule,
  ],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
