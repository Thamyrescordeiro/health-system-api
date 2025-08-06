import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module'; // Importa o módulo de banco de dados
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module';
import { PatientModule } from '../src/modules/patient/patient.module';
import { DoctorsModule } from '../src/modules/doctors/doctors.module';
import { AppoimentsModule } from '../src/modules/appoiments/appoiments.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    PatientModule,
    DoctorsModule,
    AppoimentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
