import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Admin } from '../admin/admin.entity';
import { UpdateUser } from './dtos/update-user.dto';
import { Transaction } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
  ) {}

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

  async update(userId: string, updateData: Partial<UpdateUser>) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (updateData.email && updateData.email !== user.email) {
      const exists = await this.userModel.findOne({
        where: { email: updateData.email },
      });
      if (exists) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }
    }

    await user.update(updateData);

    return this.userModel.findByPk(userId, {
      include: [
        { model: Admin, as: 'admin' },
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
    });
  }

  private async syncProfilesActive(
    userId: string,
    active: boolean,
    t?: Transaction,
  ) {
    await Promise.all([
      this.adminModel.update(
        { active },
        { where: { user_id: userId }, transaction: t },
      ),
      this.doctorModel.update(
        { active },
        { where: { user_id: userId }, transaction: t },
      ),
      this.patientModel.update(
        { active },
        { where: { user_id: userId }, transaction: t },
      ),
    ]);
  }

  async deactivateUser(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const wasActive = !!user.active;

    if (user.active) {
      await user.update({ active: false /* , transaction: t */ });
    }

    await this.syncProfilesActive(user.user_id, false /* , t */);

    const fresh = await this.userModel.findByPk(userId, {
      include: [
        { model: Admin, as: 'admin' },
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
      // transaction: t,
    });

    return {
      message: wasActive
        ? 'User deactivated successfully (profiles synced)'
        : 'User already inactive (profiles synced)',
      user: fresh!,
    };
    // });
  }

  async activateUser(userId: string) {
    // return this.sequelize.transaction(async (t) => {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const wasInactive = !user.active;

    if (!user.active) {
      await user.update({ active: true /* , transaction: t */ });
    }

    await this.syncProfilesActive(user.user_id, true /* , t */);

    const fresh = await this.userModel.findByPk(userId, {
      include: [
        { model: Admin, as: 'admin' },
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
      // transaction: t,
    });

    return {
      message: wasInactive
        ? 'User activated successfully (profiles synced)'
        : 'User already active (profiles synced)',
      user: fresh!,
    };
    // });
  }
}
