import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';
import { Appoiments } from '../appoiments/appoiments.entity';
import { CreateDoctorDto } from '../doctors/dtos/create-doctors.dto';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { CreatePatientDto } from '../patient/dtos/create-patient.dto';
import { PatientService } from '../patient/patient.service';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly patientService: PatientService,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(Appoiments)
    private readonly appoimentsModel: typeof Appoiments,
  ) {}

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

  async desactive(admin_id: string) {
    const admin = await this.findById(admin_id);
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }
    await admin.update({ active: false });
    return { message: 'Admin desactivated successfully' };
  }

  // Doctors //

  async createDoctor(createDoctor: CreateDoctorDto) {
    const doctorCreated = await this.doctorModel.create(createDoctor);
    return doctorCreated;
  }

  async findAllDoctors() {
    return this.doctorModel.findAll();
  }

  async findDoctorById(doctor_id: string) {
    return this.doctorModel.findByPk(doctor_id);
  }

  async findDoctorByCrm(crm: string) {
    return this.doctorModel.findOne({ where: { crm } });
  }

  async findDoctorByName(name: string) {
    return this.doctorModel.findOne({ where: { name } });
  }

  async findDoctorBySpecialty(specialty: string) {
    return this.doctorModel.findOne({ where: { specialty } });
  }

  async updateDoctor(
    doctor_id: string,
    updateDoctor: Partial<UpdateDoctorDto>,
  ) {
    const doctor = await this.findDoctorById(doctor_id);
    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    await doctor.update(updateDoctor);
    return doctor;
  }

  async desactiveDoctor(doctor_id: string) {
    const doctor = await this.findDoctorById(doctor_id);
    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    await doctor.update({ active: false });
    return { message: 'Doctor desactivated successfully' };
  }

  // Patients //

  async createPatient(createPatient: CreatePatientDto) {
    await this.patientService.validateCpf(createPatient.cpf);
    const patientCreated = await this.patientModel.create(createPatient);
    return patientCreated;
  }

  async findAllPatients() {
    return this.patientModel.findAll();
  }

  async findPatientById(patient_id: string) {
    return this.patientModel.findByPk(patient_id);
  }
  async findPatientByCpf(cpf: string) {
    return this.patientModel.findOne({ where: { cpf } });
  }

  async findPatientByName(name: string) {
    return this.patientModel.findOne({ where: { name } });
  }

  async UpdatePatient(
    patient_id: string,
    updatePatient: Partial<UpdatePatientDto>,
  ) {
    const patient = await this.findDoctorById(patient_id);
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update(updatePatient);
    return patient;
  }

  async desactivePatient(patient_id: string) {
    const patient = await this.findPatientById(patient_id);
    if (!patient) {
      throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update({ active: false });
    return { message: 'Patient desactivated successfully' };
  }

  // Appoiments //
}
