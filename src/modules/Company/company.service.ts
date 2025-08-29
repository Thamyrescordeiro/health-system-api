import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../Company/company.entity';
import { CreateCompanyDto } from '../Company/dtos/create-company.dto';
import { Op } from 'sequelize';
import { Admin } from '../admin/admin.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company) private companyModel: typeof Company,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Admin) private adminModel: typeof Admin,
    @InjectModel(Doctor) private doctorModel: typeof Doctor,
    @InjectModel(Patient) private patientModel: typeof Patient,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateCompanyDto) {
    return this.companyModel.create({ ...dto });
  }

  async searchByName(query: string) {
    return this.companyModel.findAll({
      where: {
        name: {
          [Op.iLike]: `%${query}%`,
        },
        active: true,
      },
      limit: 10,
    });
  }

  async deactivateCompany(companyId: string) {
    const company = await this.companyModel.findByPk(companyId, {
      include: [{ model: User, as: 'users' }],
    });

    if (!company)
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);

    await company.update({ active: false });

    if (company.users && Array.isArray(company.users)) {
      for (const user of company.users) {
        await this.userService.deactivateUser(user.user_id);
      }
    }

    return { message: 'Company and all users deactivated successfully' };
  }

  async activateCompany(companyId: string) {
    const company = await this.companyModel.findByPk(companyId, {
      include: [{ model: User, as: 'users' }],
    });

    if (!company)
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);

    await company.update({ active: true });

    if (company.users && Array.isArray(company.users)) {
      for (const user of company.users) {
        await this.userService.activateUser(user.user_id);
      }
    }

    return { message: 'Company and all users activated successfully' };
  }
}
