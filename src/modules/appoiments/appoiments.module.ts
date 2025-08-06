import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Appoiments } from './appoiments.entity';
import { AppoimentsService } from './appoiments.service';
import { PatientModule } from '../patient/patient.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { AppoimentsController } from './appoiments.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Appoiments]),
    PatientModule,
    DoctorsModule,
  ],
  providers: [AppoimentsService],
  controllers: [AppoimentsController],
})
export class AppoimentsModule {}
