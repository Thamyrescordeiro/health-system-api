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
}
