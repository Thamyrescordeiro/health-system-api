import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Appoiments } from './appoiments.entity';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';
import { UpdateAppoimentsDto } from './dtos/update-appoiments.dto';
import { PatientService } from '../patient/patient.service';
import { DoctorsService } from '../doctors/doctors.service';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';

@Injectable()
export class AppoimentsService {
  constructor(
    @InjectModel(Appoiments)
    private readonly appoimentsModel: typeof Appoiments,
    private readonly patientService: PatientService,
    private readonly doctorsService: DoctorsService,
  ) {}

  async create(appoiment: CreateAppoimentsDto) {
    const { patient_id, doctor_id, dateTime, status, notes } = appoiment;

    const patientExists = await this.patientService.patientExists(patient_id);
    if (!patientExists) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    const doctorExists = await this.doctorsService.findById(doctor_id);
    if (!doctorExists) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    const createAppoiment = await this.appoimentsModel.create({
      patient_id,
      doctor_id,
      dateTime,
      status,
      notes,
    });

    return createAppoiment;
  }

  async findAll() {
    return this.appoimentsModel.findAll({
      include: [Patient, Doctor],
    });
  }

  async findById(appoiments_id: string) {
    const appoiment = await this.appoimentsModel.findByPk(appoiments_id, {
      include: [Patient, Doctor],
    });
    if (!appoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }
    return appoiment;
  }

  async findByDate(date: string) {
    return this.appoimentsModel.findAll({
      where: { dateTime: date },
      include: [Patient, Doctor],
    });
  }

  async findByDoctor(doctor_id: string) {
    return this.appoimentsModel.findAll({
      where: { doctor_id },
      include: [Patient, Doctor],
    });
  }

  async findByCpf(cpf: string) {
    const patient = await this.patientService.findByCpf(cpf);
    if (!patient) {
      return [];
    }
    return this.appoimentsModel.findAll({
      where: { patient_id: patient.patient_id },
      include: [Patient, Doctor],
    });
  }

  async update(appoiments_id: string, updateData: UpdateAppoimentsDto) {
    const existingAppoiment =
      await this.appoimentsModel.findByPk(appoiments_id);
    if (!existingAppoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }

    if (updateData.patient_id) {
      const patientExists = await this.patientService.patientExists(
        updateData.patient_id,
      );
      if (!patientExists) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
    }

    if (updateData.doctor_id) {
      const doctorExists = await this.doctorsService.findById(
        updateData.doctor_id,
      );
      if (!doctorExists) {
        throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
      }
    }

    await this.appoimentsModel.update(updateData, { where: { appoiments_id } });
    const updatedAppoiment = await this.appoimentsModel.findByPk(
      appoiments_id,
      {
        include: [Patient, Doctor],
      },
    );
    return updatedAppoiment;
  }

  async delete(appoiments_id: string) {
    const appoiment = await this.appoimentsModel.findByPk(appoiments_id);
    if (!appoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }
    await this.appoimentsModel.destroy({ where: { appoiments_id } });
    return { message: 'Appoiment deleted successfully' };
  }
}
