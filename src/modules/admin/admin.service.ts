// src/modules/admin/admin.service.ts
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
import { CreatePatientInlineDto } from '../patient/dtos/Create-patientInline.dto';
import { RegisterAdminDto } from '../auth/dtos/register-admin.dto';

type StatusFilter = 'all' | 'active' | 'inactive';

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

  private buildPatientQuery(companyId: string, status: StatusFilter) {
    const where: any = { company_id: companyId };

    const include = [
      {
        model: this.userModel,
        as: 'user', 
        attributes: ['user_id', 'active'], 
        required: false, 
      },
    ];

    if (status === 'active') {
      where[Op.and] = [{ active: true }, { '$user.active$': true }];
    } else if (status === 'inactive') {
      where[Op.or] = [{ active: false }, { '$user.active$': false }];
    }

    return { where, include };
  }

  //Admin//
  async updateAdmin(adminId: string, dto: Partial<RegisterAdminDto>) {
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

    return { message: 'Password reset and email sent' };
  }

  async findAllAdmins() {
    return this.adminModel.findAll({
      include: [{ model: User, attributes: ['email'] }],
    });
  }

  async listAdminsByCompany(companyId: string) {
    return this.adminModel.findAll({
      include: [{ model: User, where: { company_id: companyId } }],
    });
  }
//Companies//
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

  // Doctors//
  async findAllDoctors(
    companyId: string,
    opts: { status?: StatusFilter } = {},
  ) {
    const status = (opts.status || 'all').toLowerCase() as StatusFilter;

    const where: any = { company_id: companyId };

    if (status === 'active') {
      where[Op.and] = [{ active: true }, { '$user.active$': true }];
    } else if (status === 'inactive') {
      where[Op.or] = [{ active: false }, { '$user.active$': false }];
    }

    return this.doctorModel.findAll({
      where,
      include: [
        {
          model: this.userModel,
          as: 'user',
          attributes: ['user_id', 'active'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
      subQuery: false, 
    });
  }

  async findDoctorById(doctor_id: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { doctor_id, company_id: companyId },
    });
  }

  async findDoctorByCrm(crm: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { crm, company_id: companyId, active: true },
    });
  }

  async findDoctorByName(name: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { name, company_id: companyId, active: true },
    });
  }

  async findDoctorBySpecialty(specialty: string, companyId: string) {
    return this.doctorModel.findOne({
      where: { specialty, company_id: companyId, active: true },
    });
  }

  async updateDoctor(
    doctor_id: string,
    updateDoctor: Partial<UpdateDoctorDto>,
    companyId: string,
  ) {
    const doctor = await this.doctorModel.findOne({
      where: { doctor_id, company_id: companyId },
      include: [User],
    });

    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    await doctor.update(updateDoctor);

    if (typeof updateDoctor.active !== 'undefined') {
      if (!doctor.user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      await doctor.user.update({ active: updateDoctor.active });
    }

    return doctor;
  }
// Patients//
  async create(data: CreatePatientInlineDto & { company_id: string }) {
    const patientData = {
      ...data,
      phone: data.phone ?? '',
    };
    return this.patientModel.create(patientData);
  }

  async findAllPatients(
    companyId: string,
    opts: { status?: StatusFilter } = {},
  ) {
    const status = (opts.status || 'all').toLowerCase() as StatusFilter;

    const where: any = { company_id: companyId };
    if (status === 'active') {
      where[Op.and] = [{ active: true }, { '$user.active$': true }];
    } else if (status === 'inactive') {
      where[Op.or] = [{ active: false }, { '$user.active$': false }];
    }

    return this.patientModel.findAll({
      where,
      include: [
        {
          model: this.userModel,
          as: 'user', 
          attributes: ['user_id', 'active'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
      subQuery: false,
    });
  }

  async findPatientById(
    patient_id: string,
    companyId: string,
    status: StatusFilter = 'all',
  ) {
    const { where, include } = this.buildPatientQuery(companyId, status);
    return this.patientModel.findOne({
      where: { ...where, patient_id },
      include,
    });
  }

  async findPatientByCpf(
    cpf: string,
    companyId: string,
    status: StatusFilter = 'all',
  ) {
    const { where, include } = this.buildPatientQuery(companyId, status);
    return this.patientModel.findOne({
      where: { ...where, cpf },
      include,
    });
  }

  async findPatientByName(
    name: string,
    companyId: string,
    status: StatusFilter = 'all',
  ) {
    const { where, include } = this.buildPatientQuery(companyId, status);
    const term = `%${name}%`;
    return this.patientModel.findAll({
      where: {
        ...where,
        [Op.or]: [
          { name: { [Op.iLike]: term } },
          { lastName: { [Op.iLike]: term } },
        ],
      },
      include,
      order: [['name', 'ASC']],
      subQuery: false,
    });
  }

  async updatePatient(
    patient_id: string,
    updatePatient: Partial<UpdatePatientDto>,
    companyId: string,
  ) {
    const patient = await this.patientModel.findOne({
      where: { patient_id, company_id: companyId },
    });
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update(updatePatient);
    return patient;
  }

  async desactivePatient(patient_id: string, companyId: string) {
    const patient = await this.patientModel.findOne({
      where: { patient_id, company_id: companyId },
    });
    if (!patient) {
      throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
    }
    await patient.update({ active: false });
    return { message: 'Patient desactivated successfully' };
  }

  // --------------------------- Appointments -------------------------
  async createAppoiment(
    appoiment: CreateAppoimentsDto,
    userId: string,
    companyId: string,
  ) {
    const { doctor_id, dateTime, status, notes, patient_id, patient } =
      appoiment;

    const doctorExists = await this.doctorsService.findById(
      doctor_id,
      companyId,
    );
    if (!doctorExists) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    if (!doctorExists.active || !doctorExists.user?.active) {
      throw new HttpException(
        'Doctor is deactivated and cannot receive appointments',
        HttpStatus.BAD_REQUEST,
      );
    }

    let patientRecord: Patient | null;
    if (patient_id) {
      patientRecord = await this.patientService.findById(patient_id, companyId);
      if (!patientRecord) {
        throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
      }
    } else if (patient) {
      if (patient.cpf) {
        const existingPatient = await this.patientModel.findOne({
          where: { cpf: patient.cpf, company_id: companyId },
        });
        if (existingPatient) {
          throw new HttpException(
            'cpf is already registered for another patient',
            HttpStatus.CONFLICT,
          );
        }
      }
      patientRecord = await this.create({ ...patient, company_id: companyId });
    } else {
      throw new HttpException(
        'Patient information is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const when = new Date(dateTime);
    if (isNaN(when.getTime())) {
      throw new HttpException('Invalid dateTime', HttpStatus.BAD_REQUEST);
    }
    if (when <= new Date()) {
      throw new HttpException(
        'New date must be in the future',
        HttpStatus.BAD_REQUEST,
      );
    }
    const slot = AdminService.toLocalIsoMinute(when);

    const patientId = (patientRecord as any).patient_id as string;
    const hasPending = await this.appoimentsService.hasPendingAppointment(
      patientId,
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
      where: {
        doctor_id,
        company_id: companyId,
        dateTime: slot,
        status: {
          [Op.notIn]: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
    });
    if (existingAppointment) {
      throw new HttpException(
        'This time slot is already booked for this doctor.',
        HttpStatus.CONFLICT,
      );
    }

    let urgencyLevel: UrgencyLevel | undefined = undefined;
    if (notes) {
      urgencyLevel = await this.appoimentsService.classifyUrgency(notes);
    }

    return this.appoimentsModel.create({
      doctor_id,
      patient_id: patientId,
      dateTime: slot,
      status,
      notes,
      urgencyLevel,
      company_id: companyId,
    });
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
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    return this.appoimentsModel.findAll({
      where: {
        company_id: companyId,
        dateTime: { [Op.between]: [start, end] },
      },
      include: [Patient, Doctor],
      order: [['dateTime', 'ASC']],
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
      where: { patient_id: (patient as any).patient_id, company_id: companyId },
      include: [Patient, Doctor],
    });
  }

  async reschedule(
    appoiments_id: string,
    newDateTime: string,
    patientId: string,
    companyId: string,
    userRole: 'patient' | 'doctor' | 'admin',
  ) {
    const appointment = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
      include: [Patient, Doctor],
    });
    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    if (userRole !== 'admin') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const newDate = new Date(newDateTime);
    if (isNaN(newDate.getTime())) {
      throw new HttpException('Invalid date', HttpStatus.BAD_REQUEST);
    }
    if (newDate <= new Date()) {
      throw new HttpException(
        'New date must be in the future',
        HttpStatus.BAD_REQUEST,
      );
    }
    const slot = AdminService.toLocalIsoMinute(newDate);

    if (appointment.doctor && appointment.doctor.active === false) {
      throw new HttpException(
        'Doctor is deactivated and cannot receive appointments',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (appointment.patient && appointment.patient.active === false) {
      throw new HttpException(
        'Patient is deactivated and cannot book appointments',
        HttpStatus.BAD_REQUEST,
      );
    }

    const conflict = await this.appoimentsModel.findOne({
      where: {
        doctor_id: appointment.doctor_id,
        company_id: companyId,
        dateTime: slot,
        status: {
          [Op.notIn]: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        appoiments_id: { [Op.ne]: appoiments_id },
      },
    });
    if (conflict) {
      throw new HttpException('Time slot already booked', HttpStatus.CONFLICT);
    }

    await this.appoimentsModel.update(
      { dateTime: slot },
      { where: { appoiments_id, company_id: companyId } },
    );

    const updated = await this.appoimentsModel.findOne({
      where: { appoiments_id, company_id: companyId },
      include: [Patient, Doctor],
    });

    return updated ?? { message: 'Appointment rescheduled successfully' };
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
    const startDay = new Date(`${date}T00:00:00`);
    const endDay = new Date(`${date}T23:59:59`);

    const appointments = await this.appoimentsModel.findAll({
      where: {
        doctor_id,
        company_id: companyId,
        status: {
          [Op.notIn]: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        dateTime: { [Op.between]: [startDay, endDay] },
      },
      attributes: ['dateTime'],
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

    const takenHours = Array.from(
      new Set(
        appointments
          .map((a) => {
            const dt = new Date(a.dateTime as unknown as string);
            if (isNaN(dt.getTime())) return null;
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
          })
          .filter((x): x is string => Boolean(x)),
      ),
    );

    let freeHours = availableSlots.filter((h) => !takenHours.includes(h));

    const today = new Date();
    const todayYMD = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (date === todayYMD) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      freeHours = freeHours.filter((h) => {
        const [hh, mm] = h.split(':').map((n) => parseInt(n, 10));
        return hh * 60 + mm > nowMin;
      });
    }

    return { available: freeHours, taken: takenHours };
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

    const stats: Stats = { day: {}, week: {}, month: {} };

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

  private static toLocalIsoMinute(d: Date | string): string {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}:00`;
  }
}
