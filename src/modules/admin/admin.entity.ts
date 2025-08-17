import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';

@Table({ tableName: 'admin', timestamps: true })
export class Admin extends Model<Admin, CreateAdminDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  public admin_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cpf: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  user_id: string;

  @BelongsTo(() => User)
  user: User;
}
