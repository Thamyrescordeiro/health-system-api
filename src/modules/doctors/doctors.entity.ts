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
import { CreateDoctorDto } from './dtos/create-doctors.dto';
import { User } from '../user/user.entity';
import { Company } from '../Company/company.entity';

@Table({ tableName: 'doctors', timestamps: true })
export class Doctor extends Model<Doctor, CreateDoctorDto> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare doctor_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare crm: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare specialty: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare birthDate: string;

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
