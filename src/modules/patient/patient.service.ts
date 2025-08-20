import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { User } from '../user/user.entity'; // Import User model

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(User) private readonly userModel: typeof User, // Inject User model
  ) {}

  async create(patient: CreatePatientDto & { user_id: string }) {
    await this.validateCpf(patient.cpf);
    this.validateBirthDate(patient.birthDate);

    const createdPatient = await this.patientModel.create(patient);
    return createdPatient;
  }

  async validateCpf(cpf: string, excludePatientId?: string) {
    const existing = await this.patientModel.findOne({ where: { cpf } });

    if (existing && existing.patient_id !== excludePatientId) {
      throw new HttpException('CPF already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async findByUserId(userId: string) {
    return await this.patientModel.findOne({
      where: { user_id: userId },
      include: [{ model: this.userModel, attributes: ['email'] }],
    });
  }
  async findByCpf(cpf: string) {
    return await this.patientModel.findOne({ where: { cpf } });
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

  async findAll() {
    return this.patientModel.findAll();
  }

  async findById(patient_id: string) {
    return this.patientModel.findByPk(patient_id);
  }

  async update(patient_id: string, patient: UpdatePatientDto) {
    const existingPatient = await this.findById(patient_id);
    if (!existingPatient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    if (patient.cpf && patient.cpf !== existingPatient.cpf) {
      await this.validateCpf(patient.cpf, patient_id);
    }

    if (patient.birthDate) {
      this.validateBirthDate(patient.birthDate);
    }

    await this.patientModel.update(patient, {
      where: { patient_id: patient_id },
    });
    const updatedPatient = await this.findById(patient_id);
    return updatedPatient;
  }

  async delete(
    patient_id: string,
    userId: string,
    userRole: 'patient' | 'doctor',
  ) {
    const patient = await this.findById(patient_id);

    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    if (userRole === 'patient' && patient.user_id !== userId) {
      throw new HttpException(
        'You are not allowed to delete this patient record',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.patientModel.destroy({ where: { patient_id: patient_id } });
    return { message: 'Patient deleted successfully' };
  }

  async patientExists(id: string): Promise<boolean> {
    const patient = await this.findById(id);
    return !!patient;
  }
}
