import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../Company/company.entity';
import { CreateCompanyDto } from '../Company/dtos/create-company.dto';
import { Op } from 'sequelize';
@Injectable()
export class CompanyService {
  findById(companyId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectModel(Company) private companyModel: typeof Company) {}

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

  async deactivate(companyId: string) {
    const company = await this.companyModel.findByPk(companyId, {
      include: ['users'],
    });
    if (!company) {
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    }
    await company.update({ active: false });
    if (company.users && Array.isArray(company.users)) {
      for (const user of company.users) {
        await user.update({ active: false });
      }
    }
    return { message: 'Company and related users deactivated' };
  }
}
