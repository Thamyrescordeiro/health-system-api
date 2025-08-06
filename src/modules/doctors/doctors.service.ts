// src/doctors/doctors.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Doctor } from './doctors.entity';
import { CreateDoctorDto } from './dtos/create-doctors.dto';
import { UpdateDoctorDto } from './dtos/update-doctors.dto';
import { User } from '../user/user.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async create(doctor: CreateDoctorDto) {
    const createDoctor = await this.doctorModel.create(doctor);
    return createDoctor;
  }

  async validateEmail(email: string, excludeDoctorId?: string) {
    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser && existingUser.user_id !== excludeDoctorId) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async validateCrm(crm: string, excludeDoctorId?: string) {
    const existing = await this.doctorModel.findOne({ where: { crm } });

    if (existing && existing.doctor_id !== excludeDoctorId) {
      throw new HttpException('CRM already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  validateBirthDate(birthDate: string) {
    const parsedDate = new Date(birthDate);
    if (isNaN(parsedDate.getTime())) {
      throw new HttpException('Invalid birth date', HttpStatus.BAD_REQUEST);
    }

    const now = new Date();
    if (parsedDate > now) {
      throw new HttpException(
        'Birth date cannot be in the future',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(doctor_id: string, doctor: UpdateDoctorDto) {
    const existingDoctor = await this.findById(doctor_id);
    if (!existingDoctor) {
      // Corrigido: Mensagem de erro para Doutor
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    if (doctor.crm && doctor.crm !== existingDoctor.crm) {
      await this.validateCrm(doctor.crm, doctor_id);
    }

    if (doctor.birthDate) {
      this.validateBirthDate(doctor.birthDate);
    }

    await this.doctorModel.update(doctor, {
      where: { doctor_id: doctor_id },
    });
    const updatedDoctor = await this.findById(doctor_id);
    return updatedDoctor;
  }

  async findAll() {
    return await this.doctorModel.findAll({ include: [User] });
  }

  async findById(doctor_id: string) {
    return await this.doctorModel.findByPk(doctor_id, { include: [User] });
  }

  async findByCrm(crm: string) {
    return await this.doctorModel.findOne({ where: { crm }, include: [User] });
  }

  async findBySpecialty(specialty: string) {
    return await this.doctorModel.findOne({
      where: { specialty },
      include: [User],
    });
  }

  async delete(
    doctor_id: string,
    userId: string,
    userRole: 'patient' | 'doctor',
  ) {
    const doctor = await this.findById(doctor_id);

    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    if (userRole === 'doctor' && doctor.user_id !== userId) {
      throw new HttpException(
        'You are not allowed to delete this doctor record',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.doctorModel.destroy({ where: { doctor_id } });
    return { message: 'Doctor deleted successfully' };
  }
}
