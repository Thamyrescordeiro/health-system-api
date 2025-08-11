import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppoimentsModule } from './modules/appoiments/appoiments.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    PatientModule,
    DoctorsModule,
    AppoimentsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
