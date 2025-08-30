import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { Admin } from '../admin/admin.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';

@Table({ tableName: 'companies', timestamps: true })
export class Company extends Model<Company, CreateCompanyDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare company_id: string;

  @Column({ allowNull: false })
  declare name: string;

  @Column({ allowNull: false, unique: true })
  declare cnpj: string;

  @Column({ allowNull: true })
  declare invite_token?: string;

  @Column({ defaultValue: true })
  declare active: boolean;

  @HasMany(() => User, { foreignKey: 'company_id', as: 'users' })
  users: User[];

  @HasMany(() => Admin, { foreignKey: 'company_id', as: 'admins' })
  admins: Admin[];

  @HasMany(() => Doctor, { foreignKey: 'company_id', as: 'doctors' })
  doctors: Doctor[];

  @HasMany(() => Patient, { foreignKey: 'company_id', as: 'patients' })
  patients: Patient[];
}
