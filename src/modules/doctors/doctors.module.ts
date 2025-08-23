import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Doctor } from './doctors.entity';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { UserModule } from '../user/user.module';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [SequelizeModule.forFeature([Doctor]), UserModule, PatientModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService, SequelizeModule],
})
export class DoctorsModule {}
