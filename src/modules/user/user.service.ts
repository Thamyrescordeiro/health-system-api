import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Admin } from '../admin/admin.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async create(userDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      where: { email: userDto.email },
    });
    if (existingUser) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const createdUser = await this.userModel.create(userDto);

    return createdUser;
  }

  async findAll() {
    return this.userModel.findAll();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  async findById(user_id: string) {
    return this.userModel.findByPk(user_id);
  }

  // async update(userId: string, updateData: Partial<UpdateUserDto>) {
  //   const user = await this.userModel.findByPk(userId);
  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }

  //   await user.update(updateData);
  //   return user;
  // }

  async deactivateUser(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: [Patient, Doctor, Admin],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await user.update({ active: false });

    if (user.patient) await user.patient.update({ active: false });
    if (user.doctor) await user.doctor.update({ active: false });

    return { message: 'User and related profiles deactivated' };
  }
}
