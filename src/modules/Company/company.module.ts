import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from './company.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([Company]), UserModule],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [SequelizeModule, CompanyService],
})
export class CompanyModule {}
