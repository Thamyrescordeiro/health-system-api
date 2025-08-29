import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Admin } from '../admin/admin.entity';
import { UpdateUser } from './dtos/update-user.dto';

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

    await user.update(updateData);
    return user;
  }

  async deactivateUser(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: [
        { model: Admin, as: 'admin' },
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await user.update({ active: false });

    // 🔹 Se for admin
    if (user.admin) {
      await this.adminModel.update(
        { active: false },
        { where: { admin_id: user.admin.admin_id } },
      );
    }

    // 🔹 Se for doctor
    if (user.doctor) {
      await this.doctorModel.update(
        { active: false },
        { where: { doctor_id: user.doctor.doctor_id } },
      );
    }

    // 🔹 Se for patient
    if (user.patient) {
      await this.patientModel.update(
        { active: false },
        { where: { patient_id: user.patient.patient_id } },
      );
    }

    return { message: 'User deactivated successfully', user };
  }

  async activateUser(userId: string) {
    const user = await this.userModel.findByPk(userId, {
      include: [
        { model: Admin, as: 'admin' },
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
      ],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await user.update({ active: true });

    if (user.admin) {
      await this.adminModel.update(
        { active: true },
        { where: { admin_id: user.admin.admin_id } },
      );
    }

    if (user.doctor) {
      await this.doctorModel.update(
        { active: true },
        { where: { doctor_id: user.doctor.doctor_id } },
      );
    }

    if (user.patient) {
      await this.patientModel.update(
        { active: true },
        { where: { patient_id: user.patient.patient_id } },
      );
    }

    return { message: 'User activated successfully', user };
  }
}
