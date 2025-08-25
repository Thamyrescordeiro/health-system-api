import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';
import { Appoiments, UrgencyLevel } from '../appoiments/appoiments.entity';
import { CreateDoctorDto } from '../doctors/dtos/create-doctors.dto';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { CreatePatientDto } from '../patient/dtos/create-patient.dto';
import { PatientService } from '../patient/patient.service';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';
import { CreateAppoimentsDto } from '../appoiments/dtos/create-appoiments.dto';
import { EmailService } from 'src/Email/email.service';
import { DoctorsService } from '../doctors/doctors.service';
import { UpdateAppoimentsDto } from '../appoiments/dtos/update-appoiments.dto';
import { AppoimentsService } from '../appoiments/appoiments.service';
import { AppointmentStatus } from '../appoiments/dtos/types';
import { Op } from 'sequelize';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(Appoiments)
    private readonly appoimentsModel: typeof Appoiments,
    private readonly patientService: PatientService,
    private readonly doctorsService: DoctorsService,
    private readonly emailService: EmailService,
    private readonly appoimentsService: AppoimentsService,
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
  async createAppoiment(appoiment: CreateAppoimentsDto, userId: string) {
    const { doctor_id, dateTime, status, notes } = appoiment;

    const doctorExists = await this.doctorsService.findById(doctor_id);
    if (!doctorExists) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    const patientExists = await this.patientService.findByUserId(userId);
    if (!patientExists) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    const hasPending = await this.appoimentsService.hasPendingAppointment(
      patientExists.getDataValue('patient_id'),
      doctor_id,
    );

    if (hasPending) {
      throw new HttpException(
        'You must complete your previous appointment with this doctor before booking a new one.',
        HttpStatus.CONFLICT,
      );
    }

    const existingAppointment = await this.appoimentsModel.findOne({
      where: { doctor_id, dateTime },
    });
    if (existingAppointment) {
      throw new HttpException(
        'This time slot is already booked for this doctor.',
        HttpStatus.CONFLICT,
      );
    }

    let urgencyLevel: UrgencyLevel | null = null;
    if (notes) {
      urgencyLevel = await this.appoimentsService.classifyUrgency(notes);
    }
    const newAppointment = {
      patient_id: patientExists.getDataValue('patient_id'),
      doctor_id,
      dateTime,
      status,
      notes,
      urgencyLevel,
    };

    const patientEmail = patientExists.user?.email;
    if (!patientEmail) {
      throw new HttpException(
        'Patient email not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.emailService.sendMail(
      patientEmail,
      'Consulta Confirmada',
      `Olá ${patientExists.name}, sua consulta com Dr(a). ${doctorExists.name} foi agendada para ${new Date(dateTime).toLocaleString()}.`,
    );

    if (doctorExists.user?.email) {
      await this.emailService.sendMail(
        doctorExists.user.email,
        'Nova Consulta Agendada',
        `Olá Dr(a). ${doctorExists.name}, você tem uma nova consulta com ${patientExists.name} no dia ${new Date(dateTime).toLocaleString()}.`,
      );
    }

    return await this.appoimentsModel.create(newAppointment);
  }

  async findAllAppoiments() {
    return this.appoimentsModel.findAll({
      include: [Patient, Doctor],
    });
  }

  async findAppoimentsById(
    appoiments_id: string,
    userId: string,
    userRole: 'patient' | 'doctor' | 'admin',
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
    const appointment = await this.findAppoimentsById(
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

  async updateAppoiment(
    appoiments_id: string,
    updateData: UpdateAppoimentsDto,
  ) {
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

  async cancelAppoiment(appoiments_id: string) {
    const appoiment = await this.appoimentsModel.findByPk(appoiments_id);
    if (!appoiment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }
    await this.appoimentsModel.update(
      { status: AppointmentStatus.CANCELLED },
      { where: { appoiments_id } },
    );

    return { message: 'Appointment cancelled successfully' };
  }

  async getAppoimentsStats() {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    type Stats = {
      day: Record<string, number>;
      week: Record<string, number>;
      month: Record<string, number>;
    };

    const stats: Stats = {
      day: {},
      week: {},
      month: {},
    };

    for (const status of Object.values(AppointmentStatus)) {
      stats.day[status] = await this.appoimentsModel.count({
        where: {
          status,
          dateTime: { [Op.between]: [startOfDay, endOfDay] },
        },
      });

      stats.week[status] = await this.appoimentsModel.count({
        where: {
          status,
          dateTime: { [Op.between]: [startOfWeek, endOfWeek] },
        },
      });

      stats.month[status] = await this.appoimentsModel.count({
        where: {
          status,
          dateTime: { [Op.between]: [startOfMonth, endOfMonth] },
        },
      });
    }

    return stats;
  }
}
