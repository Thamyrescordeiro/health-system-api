import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Patient } from './patient.entity';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Patient]), UserModule, AuthModule],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService, SequelizeModule],
})
export class PatientModule {}
