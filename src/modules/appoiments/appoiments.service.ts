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

  async create(appoiment: CreateAppoimentsDto, patientId: string) {
    const { doctor_id, dateTime, status, notes } = appoiment;

    const doctorExists = await this.doctorsService.findById(doctor_id);
    if (!doctorExists) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    const patientExists = await this.patientService.findById(patientId);
    if (!patientExists) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    const patientEmail = patientExists.user?.email;
    if (!patientEmail) {
      throw new HttpException(
        'Patient email not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createAppoiment = await this.appoimentsModel.create<Appoiments>({
      patient_id: patientExists.patient_id,
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

  async findById(
    appoiments_id: string,
    userId: string,
    userRole: 'patient' | 'doctor',
  ) {
    const appoiment = await this.appoimentsModel.findByPk(appoiments_id, {
      include: [Patient, Doctor],
    });
    if (!appoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }

    if (userRole === 'patient' && appoiment.patient_id !== userId) {
      throw new HttpException(
        'You are not allowed to view this appoiment',
        HttpStatus.FORBIDDEN,
      );
    }

    if (userRole === 'doctor' && appoiment.doctor_id !== userId) {
      throw new HttpException(
        'You are not allowed to view this appoiment',
        HttpStatus.FORBIDDEN,
      );
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

  async findByPatient(patientId: string) {
    return this.appoimentsModel.findAll({
      where: { patient_id: patientId },
      include: [Doctor],
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

  async reschedule(
    appoiments_id: string,
    newDateTime: string,
    patientId: string,
  ) {
    const appointment = await this.findById(
      appoiments_id,
      patientId,
      'patient',
    );

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    const newDate = new Date(newDateTime);
    if (isNaN(newDate.getTime())) {
      throw new HttpException('Invalid birth date', HttpStatus.BAD_REQUEST);
    }

    if (newDate <= new Date()) {
      throw new HttpException(
        'New date must be in the future',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.appoimentsModel.update(
      { dateTime: newDateTime },
      { where: { appoiments_id } },
    );
    return { message: 'Appointment rescheduled successfully' };
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

  async delete(
    appoiments_id: string,
    userId: string,
    userRole: 'patient' | 'doctor',
  ) {
    const appoiment = await this.appoimentsModel.findByPk(appoiments_id);
    if (!appoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }

    if (userRole === 'patient' && appoiment.patient_id !== userId) {
      throw new HttpException(
        'You are not allowed to delete this appoiment',
        HttpStatus.FORBIDDEN,
      );
    }

    if (userRole === 'doctor' && appoiment.doctor_id !== userId) {
      throw new HttpException(
        'You are not allowed to delete this appoiment',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.appoimentsModel.destroy({ where: { appoiments_id } });
    return { message: 'Appoiment deleted successfully' };
  }

  async findAvailableByDoctor(doctor_id: string, date: string) {
    const startDay = new Date(date + 'T00:00:00');
    const endDay = new Date(date + 'T23:59:59');

    const appointments = await this.appoimentsModel.findAll({
      where: {
        doctor_id,
        dateTime: {
          $between: [startDay, endDay],
        },
      },
    });
    const availableSlots = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '14:00',
      '15:00',
      '16:00',
    ];
    const takenHours = appointments.map((a) =>
      new Date(a.dateTime).toISOString().substring(11, 16),
    );

    return availableSlots.filter((hour) => !takenHours.includes(hour));
  }
}
