import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Patient } from './patient.entity';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { User } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly authService: AuthService,
  ) {}

  async validateCpf(cpf: string, companyId: string, excludePatientId?: string) {
    const existing = await this.patientModel.findOne({
      where: { cpf, company_id: companyId },
    });

    if (existing && existing.patient_id !== excludePatientId) {
      throw new HttpException('CPF already exists', HttpStatus.BAD_REQUEST);
    }
    return true;
  }

  async findByUserId(userId: string, companyId: string) {
    return await this.patientModel.findOne({
      where: { user_id: userId, company_id: companyId },
      include: [{ model: this.userModel, attributes: ['email'] }],
    });
  }

  async findByCpf(cpf: string, companyId: string) {
    return await this.patientModel.findOne({
      where: { cpf, company_id: companyId },
    });
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

  async findAll(companyId: string) {
    return this.patientModel.findAll({ where: { company_id: companyId } });
  }

  async findById(patient_id: string, companyId: string) {
    return this.patientModel.findOne({
      where: { patient_id, company_id: companyId },
    });
  }

  async update(
    patient_id: string,
    patient: UpdatePatientDto,
    companyId: string,
  ) {
    const existingPatient = await this.findById(patient_id, companyId);
    if (!existingPatient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    if (patient.cpf && patient.cpf !== existingPatient.cpf) {
      await this.validateCpf(patient.cpf, companyId, patient_id);
    }

    if (patient.birthDate) {
      this.validateBirthDate(patient.birthDate);
    }

    await this.patientModel.update(patient, {
      where: { patient_id, company_id: companyId },
    });

    const updatedPatient = await this.findById(patient_id, companyId);
    return updatedPatient;
  }

  async desactivePatient(patient_id: string, companyId: string) {
    const patient = await this.findById(patient_id, companyId);
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    await this.patientModel.update(
      { active: false },
      { where: { patient_id, company_id: companyId } },
    );
    return { message: 'Patient deactivated successfully' };
  }

  async patientExists(patient_id: string, companyId: string): Promise<boolean> {
    const patient = await this.findById(patient_id, companyId);
    return !!patient;
  }
}
