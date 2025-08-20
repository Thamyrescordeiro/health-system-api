import { Model } from 'sequelize-typescript';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
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

@Table({ tableName: 'appoiments', timestamps: true })
export class Appoiments extends Model<Appoiments, CreateAppoimentsDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  appoiments_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  dateTime: string;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    allowNull: false,
  })
  status: AppointmentStatus;

  @Column({
    type: DataType.STRING,
  })
  notes: string;

  @ForeignKey(() => Patient)
  @Column({ type: DataType.UUID, allowNull: false })
  patient_id: string;

  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => Doctor)
  doctor_id: string;

  @BelongsTo(() => Doctor)
  doctor: Doctor;
}
