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
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dtos/create-user.dto';
import { Patient } from '../patient/patient.entity';

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

  @Column({
    type: DataType.ENUM('patient', 'doctor', 'admin'),
    allowNull: false,
  })
  declare role: 'patient' | 'doctor' | 'admin';

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
}
