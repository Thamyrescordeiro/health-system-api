import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { AdminController } from './admin.controller';
import { PatientModule } from '../patient/patient.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { AppoimentsModule } from '../appoiments/appoiments.module';
import { EmailModule } from 'src/Email/email.module';
import { CompanyModule } from '../Company/company.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Admin]),
    PatientModule,
    DoctorsModule,
    AppoimentsModule,
    EmailModule,
    CompanyModule,
    UserModule,
  ],

  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
