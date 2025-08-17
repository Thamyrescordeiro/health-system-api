import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin) private readonly adminModel: typeof Admin) {}

  async create(adminDto: CreateAdminDto) {
    await this.validateCpf(adminDto.cpf);
    const adminCreated = await this.adminModel.create(adminDto);
    return adminCreated;
  }

  async validateCpf(cpf: string, excludeAdminId?: string) {
    const existing = await this.adminModel.findOne({ where: { cpf } });

    if (existing && existing.admin_id !== excludeAdminId) {
      throw new HttpException('CPF already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async findAll() {
    return this.adminModel.findAll();
  }

  async findById(admin_id: string) {
    return this.adminModel.findByPk(admin_id);
  }

  async delete(admin_id: string) {
    const admin = await this.findById(admin_id);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    await this.adminModel.destroy({ where: { admin_id } });
    return { message: 'Admin deleted successfully' };
  }
}
