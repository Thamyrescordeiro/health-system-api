import {
  Table,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Model,
  BeforeCreate,
  BeforeUpdate,
  HasOne,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dtos/create-user.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Company } from '../Company/company.entity';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, CreateUserDto> {
  async comparePassword(pass: string): Promise<boolean> {
    return await bcrypt.compare(pass, this.password);
  }

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ defaultValue: true })
  declare active: boolean;

  @Column({ allowNull: true })
  reset_code: string;

  @Column({ type: DataType.DATE, allowNull: true })
  reset_code_expires_at: Date;

  @Column({ defaultValue: false })
  reset_code_used: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  last_reset_request_at?: Date;

  @Column({
    type: DataType.ENUM('patient', 'doctor', 'admin', 'super_admin'),
    allowNull: false,
  })
  declare role: 'patient' | 'doctor' | 'admin' | 'super_admin';

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: true })
  declare company_id?: string;

  @BelongsTo(() => Company)
  company: Company;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    const pwd = instance.getDataValue('password');

    if (
      instance.changed('password') &&
      typeof pwd === 'string' &&
      pwd.length > 0
    ) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(pwd, salt);
      instance.setDataValue('password', hashed);
    }
  }
  @HasOne(() => Patient)
  patient: Patient;

  @HasOne(() => Doctor)
  doctor: Doctor;
}
