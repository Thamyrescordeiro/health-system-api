import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Appoiments, UrgencyLevel } from './appoiments.entity';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';
import { UpdateAppoimentsDto } from './dtos/update-appoiments.dto';
import { PatientService } from '../patient/patient.service';
import { DoctorsService } from '../doctors/doctors.service';
import { Patient } from '../patient/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { EmailService } from '../../Email/email.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Op } from 'sequelize';
import { AppointmentStatus } from './dtos/types';

@Injectable()
export class AppoimentsService {
  constructor(
    @InjectModel(Appoiments)
    private readonly appoimentsModel: typeof Appoiments,
    private readonly patientService: PatientService,
    private readonly doctorsService: DoctorsService,
    private readonly emailService: EmailService,

    @InjectModel(Patient) private readonly patientModel: typeof Patient,
  ) {}

  async create(
    appoiment: CreateAppoimentsDto,
    userId: string,
    companyId: string,
  ) {
    const { doctor_id, dateTime, status, notes } = appoiment;

    const doctorExists = await this.doctorsService.findById(
      doctor_id,
      companyId,
    );
    if (!doctorExists) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    const patientExists = await this.patientService.findByUserId(
      userId,
      companyId,
    );
    if (!patientExists) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    const hasPending = await this.hasPendingAppointment(
      patientExists.getDataValue('patient_id'),
      doctor_id,
      companyId,
    );

    if (hasPending) {
      throw new HttpException(
        'You must complete your previous appointment with this doctor before booking a new one.',
        HttpStatus.CONFLICT,
      );
    }

    const existingAppointment = await this.appoimentsModel.findOne({
      where: { doctor_id, dateTime, company_id: companyId },
    });
    if (existingAppointment) {
      throw new HttpException(
        'This time slot is already booked for this doctor.',
        HttpStatus.CONFLICT,
      );
    }

    let urgencyLevel: UrgencyLevel | null = null;
    if (notes) {
      urgencyLevel = await this.classifyUrgency(notes);
    }
    const newAppointment = {
      patient_id: patientExists.getDataValue('patient_id'),
      doctor_id,
      dateTime,
      status,
      notes,
      urgencyLevel,
      company_id: companyId,
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

  async findAll(companyId: string) {
    return this.appoimentsModel.findAll({
      where: { company_id: companyId },
      include: [Patient, Doctor],
    });
  }

  async findById(
    appoiments_id: string,
    userId: string,
    companyId: string,
    userRole: 'patient' | 'doctor' | 'admin',
  ) {
    const appoiment = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
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

  async findByDate(date: string, companyId: string) {
    return this.appoimentsModel.findAll({
      where: { dateTime: date, company_id: companyId },
      include: [Patient, Doctor],
    });
  }

  async findByDoctor(doctor_id: string, companyId: string) {
    return this.appoimentsModel.findAll({
      where: { doctor_id, company_id: companyId },
      include: [Patient, Doctor],
    });
  }

  async findByPatient(patientId: string, companyId: string) {
    return this.appoimentsModel.findAll({
      where: { patient_id: patientId, company_id: companyId },
      include: [Doctor],
    });
  }

  async findByCpf(cpf: string, companyId: string) {
    const patient = await this.patientService.findByCpf(cpf, companyId);
    if (!patient) {
      return [];
    }
    return this.appoimentsModel.findAll({
      where: { patient_id: patient.patient_id, company_id: companyId },
      include: [Patient, Doctor],
    });
  }

  async reschedule(
    appoiments_id: string,
    newDateTime: string,
    patientId: string,
    companyId: string,
  ) {
    const appointment = await this.findById(
      appoiments_id,
      patientId,
      companyId,
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
      { where: { appoiments_id, company_id: companyId } },
    );
    return { message: 'Appointment rescheduled successfully' };
  }

  async update(
    appoiments_id: string,
    updateData: UpdateAppoimentsDto,
    companyId: string,
  ) {
    const existingAppoiment = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
    });
    if (!existingAppoiment) {
      throw new HttpException('Appoiment not found', HttpStatus.NOT_FOUND);
    }

    if (updateData.patient_id) {
      const patientExists = await this.patientService.patientExists(
        updateData.patient_id,
        companyId,
      );
      if (!patientExists) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
    }

    if (updateData.doctor_id) {
      const doctorExists = await this.doctorsService.findById(
        updateData.doctor_id,
        companyId,
      );
      if (!doctorExists) {
        throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
      }
    }

    await this.appoimentsModel.update(updateData, {
      where: { appoiments_id, company_id: companyId },
    });
    const updatedAppoiment = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
      include: [Patient, Doctor],
    });
    return updatedAppoiment;
  }

  async cancelAppoiment(appoiments_id: string, companyId: string) {
    const appoiment = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
    });
    if (!appoiment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }
    await this.appoimentsModel.update(
      { status: AppointmentStatus.CANCELLED },
      { where: { appoiments_id, company_id: companyId } },
    );

    return { message: 'Appointment cancelled successfully' };
  }

  async findAvailableByDoctor(
    doctor_id: string,
    date: string,
    companyId: string,
  ) {
    const startDay = new Date(date + 'T00:00:00');
    const endDay = new Date(date + 'T23:59:59');

    const appointments = await this.appoimentsModel.findAll({
      where: {
        doctor_id,
        company_id: companyId,
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

  async classifyUrgency(notes: string): Promise<UrgencyLevel> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
Você é um assistente médico especializado em triagem de urgências. 
Classifique o nível de urgência de acordo com os sintomas abaixo em:

- HIGH: risco imediato, precisa de atendimento urgente (ex: convulsão, dor no peito intensa, sangramento abundante)
- MEDIUM: sintomas preocupantes, mas não emergenciais (ex: febre alta, dor moderada, infecção)
- LOW: sintomas leves ou de rotina (ex: resfriado, pequenas dores)

Nota do paciente: "${notes}"

Retorne apenas HIGH, MEDIUM ou LOW.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim().toUpperCase();

      if (response.includes('HIGH')) return UrgencyLevel.HIGH;
      if (response.includes('MEDIUM')) return UrgencyLevel.MEDIUM;
      return UrgencyLevel.LOW;
    } catch (error) {
      console.error('Erro ao classificar urgência:', error);
      return UrgencyLevel.LOW;
    }
  }

  async hasPendingAppointment(
    patientId: string,
    doctorId: string,
    companyId: string,
  ) {
    const pendingAppointment = await this.appoimentsModel.findOne({
      where: {
        doctor_id: doctorId,
        patient_id: patientId,
        company_id: companyId,
        status: {
          [Op.ne]: AppointmentStatus.COMPLETED,
        },
      },
    });

    return !!pendingAppointment;
  }
}
