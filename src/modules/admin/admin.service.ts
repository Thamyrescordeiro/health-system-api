import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Admin } from './admin.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Patient } from '../patient/patient.entity';
import { Appoiments, UrgencyLevel } from '../appoiments/appoiments.entity';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { PatientService } from '../patient/patient.service';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';
import { CreateAppoimentsDto } from '../appoiments/dtos/create-appoiments.dto';
import { EmailService } from 'src/Email/email.service';
import { DoctorsService } from '../doctors/doctors.service';
import { UpdateAppoimentsDto } from '../appoiments/dtos/update-appoiments.dto';
import { AppoimentsService } from '../appoiments/appoiments.service';
import { AppointmentStatus } from '../appoiments/dtos/types';
import { Company } from '../Company/company.entity';
import { CreateCompanyDto } from '../Company/dtos/create-company.dto';
import { Op } from 'sequelize';
import { User } from '../user/user.entity';
import { CompanyService } from '../Company/company.service';
import { RegisterDto } from '../auth/dtos/register.dto';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Doctor) private readonly doctorModel: typeof Doctor,
    @InjectModel(Patient) private readonly patientModel: typeof Patient,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(Appoiments)
    private readonly appoimentsModel: typeof Appoiments,
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly patientService: PatientService,
    private readonly doctorsService: DoctorsService,
    private readonly emailService: EmailService,
    private readonly appoimentsService: AppoimentsService,
    private readonly companyService: CompanyService,
  ) {}

  // Admin //
  async updateAdmin(adminId: string, dto: Partial<RegisterDto>) {
    const user = await this.userModel.findByPk(adminId);
    if (!user) throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    await user.update(dto);
    return user;
  }

  async desactiveAdmin(adminId: string) {
    const user = await this.userModel.findByPk(adminId);
    if (!user) throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    await user.update({ active: false });
    return { message: 'Admin deactivated' };
  }

  async resetAdminPassword(adminId: string) {
    const admin = await this.adminModel.findByPk(adminId);
    if (!admin)
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);

    const user = await this.userModel.findByPk(admin.user_id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const newPassword = Math.random().toString(36).slice(-8);
    await user.update({ password: newPassword });

    await this.emailService.sendMail(
      user.email,
      'Sua senha foi resetada',
      `Olá ${admin.name}, sua nova senha é: ${newPassword}`,
    );

    return {
      message: 'Password reset and email sent',
    };
  }

  async findAllAdmins() {
    return this.adminModel.findAll({
      include: [
        {
          model: User,
          attributes: ['email'],
        },
      ],
    });
  }

  async listAdminsByCompany(companyId: string) {
    return this.adminModel.findAll({
      include: [
        {
          model: User,
          where: { company_id: companyId },
        },
      ],
    });
  }
  // Companies //

  async findAllCompanies() {
    return this.companyModel.findAll();
  }

  async createCompany(dto: CreateCompanyDto) {
    return this.companyModel.create(dto);
  }

  async updateCompany(companyId: string, dto: CreateCompanyDto) {
    const company = await this.companyModel.findByPk(companyId);
    if (!company)
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    await company.update(dto);
    return company;
  }

  async deactivateCompany(companyId: string) {
    const company = await this.companyModel.findByPk(companyId, {
      include: [{ model: User, as: 'users' }],
    });
    if (!company)
      throw new HttpException('Company not found', HttpStatus.NOT_FOUND);

    await company.update({ active: false });

    if (company.users && Array.isArray(company.users)) {
      for (const user of company.users) {
        await user.update({ active: false });
      }
    }
    return { message: 'Company and users deactivated' };
  }

  async listAdmins(companyId: string) {
    return this.adminModel.findAll({
      include: [
        {
          model: User,
          where: { company_id: companyId },
          attributes: ['email', 'active'],
        },
      ],
    });
  }

  // Doctors //

  async findAllDoctors(companyId: string) {
    return this.doctorModel.findAll({ where: { company_id: companyId } });
  }

  async findDoctorById(doctor_id: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { doctor_id, company_id: companyId },
    });
  }

  async findDoctorByCrm(crm: string, companyId: string) {
    return this.doctorModel.findOne({ where: { crm, company_id: companyId } });
  }

  async findDoctorByName(name: string, companyId: string) {
    return this.doctorModel.findOne({ where: { name, company_id: companyId } });
  }

  async findDoctorBySpecialty(specialty: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { specialty, company_id: companyId },
    });
  }

  async updateDoctor(
    doctor_id: string,
    updateDoctor: Partial<UpdateDoctorDto>,
    companyId: string,
  ) {
    const doctor = await this.findDoctorById(doctor_id, companyId);
    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    await doctor.update(updateDoctor);
    return doctor;
  }

  async desactiveDoctor(doctor_id: string, companyId: string) {
    const doctor = await this.findDoctorById(doctor_id, companyId);
    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }
    await doctor.update({ active: false });
    return { message: 'Doctor desactivated successfully' };
  }
  // Patients //

  async findAllPatients(companyId: string) {
    return this.patientModel.findAll({ where: { company_id: companyId } });
  }

  async findPatientById(patient_id: string, companyId: string) {
    return this.patientModel.findOne({
      where: { patient_id, company_id: companyId },
    });
  }

  async findPatientByCpf(cpf: string, companyId: string) {
    return this.patientModel.findOne({ where: { cpf, company_id: companyId } });
  }

  async findPatientByName(name: string, companyId: string) {
    return this.patientModel.findOne({
      where: { name, company_id: companyId },
    });
  }

  async updatePatient(
    patient_id: string,
    updatePatient: Partial<UpdatePatientDto>,
    companyId: string,
  ) {
    const patient = await this.findPatientById(patient_id, companyId);
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update(updatePatient);
    return patient;
  }

  async desactivePatient(patient_id: string, companyId: string) {
    const patient = await this.findPatientById(patient_id, companyId);
    if (!patient) {
      throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update({ active: false });
    return { message: 'Patient desactivated successfully' };
  }

  // Appoiments //
  async createAppoiment(
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
    const hasPending = await this.appoimentsService.hasPendingAppointment(
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
      urgencyLevel = await this.appoimentsService.classifyUrgency(notes);
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

  async findAllAppoiments(companyId: string) {
    return this.appoimentsService.findAll(companyId);
  }

  async findAppoimentsById(
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
    const appointment = await this.findAppoimentsById(
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

  async updateAppoiment(
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

  async getAppoimentsStats(companyId: string) {
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
          company_id: companyId,
          dateTime: { [Op.between]: [startOfDay, endOfDay] },
        },
      });

      stats.week[status] = await this.appoimentsModel.count({
        where: {
          status,
          company_id: companyId,
          dateTime: { [Op.between]: [startOfWeek, endOfWeek] },
        },
      });

      stats.month[status] = await this.appoimentsModel.count({
        where: {
          status,
          company_id: companyId,
          dateTime: { [Op.between]: [startOfMonth, endOfMonth] },
        },
      });
    }

    return stats;
  }
}
