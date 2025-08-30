import { Model } from 'sequelize-typescript';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Company } from '../Company/company.entity';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { AppointmentStatus } from './dtos/types';

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Table({ tableName: 'appoiments', timestamps: true })
export class Appoiments extends Model<Appoiments, CreateAppoimentsDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare appoiments_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare dateTime: string;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    allowNull: false,
  })
  declare status: AppointmentStatus;

  @Column({
    type: DataType.STRING,
  })
  declare notes: string;

  @Column({
    type: DataType.ENUM(...Object.values(UrgencyLevel)),
    allowNull: true,
  })
  declare urgencyLevel: UrgencyLevel;

  @ForeignKey(() => Company)
  @Column(DataType.UUID)
  declare company_id: string;

  @BelongsTo(() => Company)
  declare company: Company;

  @ForeignKey(() => Patient)
  @Column({ type: DataType.UUID, allowNull: false })
  declare patient_id: string;

  @BelongsTo(() => Patient)
  declare patient: Patient;

  @ForeignKey(() => Doctor)
  declare doctor_id: string;

  @BelongsTo(() => Doctor)
  declare doctor: Doctor;
}
