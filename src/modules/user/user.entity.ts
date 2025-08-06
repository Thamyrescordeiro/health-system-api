import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, CreateUserDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public user_id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM('patient', 'doctor'),
    allowNull: false,
  })
  role: 'patient' | 'doctor';

  @BeforeCreate
  @BeforeUpdate
  public static hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = bcrypt.genSaltSync();
      instance.password = bcrypt.hashSync(instance.password, salt);
    }
  }

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
