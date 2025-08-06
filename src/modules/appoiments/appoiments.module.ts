import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Appoiments } from './appoiments.entity';
import { AppoimentsService } from './appoiments.service';
import { PatientModule } from '../patient/patient.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Appoiments]),
    PatientModule,
    DoctorsModule,
  ],
  providers: [AppoimentsService],
})
export class AppoimentsModule {}
