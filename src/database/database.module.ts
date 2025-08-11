import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SequelizeModule } from '@nestjs/sequelize';
import { Patient } from '../modules/patient/patient.entity';
import { User } from 'src/modules/user/user.entity';
import { Doctor } from 'src/modules/doctors/doctors.entity';
import { Appoiments } from '../modules/appoiments/appoiments.entity';

dotenv.config();
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Patient, User, Doctor, Appoiments],
      autoLoadModels: true,
      synchronize: true,
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
