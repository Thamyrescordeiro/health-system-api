import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Doctor } from './doctors.entity';
import { UpdateDoctorDto } from './dtos/update-doctors.dto';
import { User } from '../user/user.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async validateEmail(
    email: string,
    excludeUserId?: string,
    companyId?: string,
  ) {
    const existingUser = await this.userModel.findOne({
      where: { email, company_id: companyId },
    });
    if (existingUser && existingUser.user_id !== excludeUserId) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async validateCrm(crm: string, companyId: string, excludeDoctorId?: string) {
    const existing = await this.doctorModel.findOne({
      where: { crm, company_id: companyId },
    });
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

  async update(doctor_id: string, doctor: UpdateDoctorDto, companyId: string) {
    const existingDoctor = await this.findById(doctor_id, companyId);
    if (!existingDoctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    if (doctor.crm && doctor.crm !== existingDoctor.crm) {
      await this.validateCrm(doctor.crm, doctor_id);
    }

    if (doctor.birthDate) {
      this.validateBirthDate(doctor.birthDate);
    }

    await this.doctorModel.update(doctor, {
      where: { doctor_id, company_id: companyId },
    });
    const updatedDoctor = await this.findById(doctor_id, companyId);
    return updatedDoctor;
  }

  async findAll(companyId: string) {
    return await this.doctorModel.findAll({
      where: { company_id: companyId },
      include: [User],
    });
  }

  async findById(doctor_id: string, companyId: string) {
    return await this.doctorModel.findOne({
      where: { doctor_id, company_id: companyId },
      include: [User],
    });
  }

  async findByCrm(crm: string, companyId: string) {
    return await this.doctorModel.findOne({
      where: { crm, company_id: companyId },
      include: [User],
    });
  }

  async findBySpecialty(specialty: string, companyId: string) {
    return await this.doctorModel.findAll({
      where: { specialty, company_id: companyId },
      include: [User],
    });
  }

  async findAllSpecialties(companyId: string) {
    const doctors = await this.doctorModel.findAll({
      where: { company_id: companyId },
    });
    return [...new Set(doctors.map((d) => d.specialty))];
  }

  async desactiveDoctor(doctor_id: string, companyId: string) {
    const doctor = await this.findById(doctor_id, companyId);
    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    doctor.active = false;
    await doctor.save();
    return { message: 'Doctor deactivated successfully' };
  }
}
