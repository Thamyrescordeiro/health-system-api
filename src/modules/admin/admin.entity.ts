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
import { Company } from '../Company/company.entity';

@Table({ tableName: 'admin', timestamps: true })
export class Admin extends Model<Admin, CreateAdminDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare admin_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastname: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare cpf: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare active: boolean;

  @ForeignKey(() => Company)
  @Column({ type: DataType.UUID, allowNull: false })
  company_id: string;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;
}
