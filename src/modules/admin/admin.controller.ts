import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RegisterAdminDto } from '../auth/dtos/register-admin.dto';
import { UpdateAppoimentsDto } from '../appoiments/dtos/update-appoiments.dto';
import { InjectModel } from '@nestjs/sequelize';
import { AdminService } from './admin.service';
import { EmailService } from 'src/Email/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Company } from '../Company/company.entity';
import { CreateCompanyDto } from '../Company/dtos/create-company.dto';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';
import { CreateAppoimentsDto } from '../appoiments/dtos/create-appoiments.dto';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
  company_id: string;
}

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
    @InjectModel(Company) private readonly companyModel: typeof Company,
  ) {}

  @Get()
  @Roles('super_admin')
  async findAllAdmins() {
    return this.adminService.findAllAdmins();
  }

  @Get('company/:companyId')
  @Roles('super_admin')
  async listAdmins(@Param('companyId') company_id: string) {
    return this.adminService.listAdminsByCompany(company_id);
  }

  @Get('companies')
  @Roles('super_admin')
  async findAllCompanies() {
    return this.adminService.findAllCompanies();
  }

  @Post('create/companies')
  @Roles('super_admin')
  async createCompany(@Body() dto: CreateCompanyDto) {
    return this.adminService.createCompany(dto);
  }

  @Patch('companies/:id')
  @Roles('super_admin')
  async updateCompany(@Param('id') id: string, @Body() dto: CreateCompanyDto) {
    return this.adminService.updateCompany(id, dto);
  }

  @Post('companies/:id/deactivate')
  @Roles('super_admin')
  async deactivateCompany(@Param('id') id: string) {
    return this.adminService.deactivateCompany(id);
  }

  @Get('invite')
  @Roles('admin')
  async getInviteLink(@Req() req: Request & { user: { company_id: string } }) {
    const companyId = req.user.company_id;
    const company = await this.companyModel.findByPk(companyId);
    if (!company || !company.invite_token) {
      throw new HttpException('Invite not found', HttpStatus.NOT_FOUND);
    }
    const frontUrl = process.env.FRONT_URL;
    return {
      inviteLink: `${frontUrl}/register/patient?companyId=${companyId}&token=${company.invite_token}`,
    };
  }

  @Get('doctors')
  @Roles('admin')
  async findAllDoctors(
    @Req() req: Request & { user: { company_id: string } },
    @Query('status') status?: 'all' | 'active' | 'inactive',
  ) {
    const companyId = req.user.company_id;
    const norm = (status || 'all').toLowerCase() as
      | 'all'
      | 'active'
      | 'inactive';
    return this.adminService.findAllDoctors(companyId, { status: norm });
  }

  @Get('doctors/:id')
  @Roles('admin')
  async findDoctorById(
    @Param('id') id: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findDoctorById(id, req.user.company_id);
  }

  @Get('doctor/crm/:crm')
  @Roles('admin')
  async findDoctorByCrm(
    @Param('crm') crm: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findDoctorByCrm(crm, req.user.company_id);
  }

  @Get('doctor/specialty/:specialty')
  @Roles('admin')
  async findDoctorBySpecialty(
    @Param('specialty') specialty: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findDoctorBySpecialty(
      specialty,
      req.user.company_id,
    );
  }

  @Get('doctor/name/:name')
  @Roles('admin')
  async findDoctorByName(
    @Param('name') name: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findDoctorByName(name, req.user.company_id);
  }

  @Patch('doctor/:id')
  @Roles('admin')
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateDoctorDto: Partial<UpdateDoctorDto>,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.updateDoctor(
      id,
      updateDoctorDto,
      req.user.company_id,
    );
  }

  @Get('patients')
  @Roles('admin')
  async findAllPatients(
    @Req() req: Request & { user: { company_id: string } },
    @Query('status') status?: 'all' | 'active' | 'inactive',
  ) {
    const norm = (status || 'all').toLowerCase() as
      | 'all'
      | 'active'
      | 'inactive';
    return this.adminService.findAllPatients(req.user.company_id, {
      status: norm,
    });
  }

  @Get('patients/:id')
  @Roles('admin')
  async findPatientById(
    @Param('id') id: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findPatientById(id, req.user.company_id);
  }

  @Get('patients/cpf/:cpf')
  @Roles('admin')
  async findPatientByCpf(
    @Param('cpf') cpf: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findPatientByCpf(cpf, req.user.company_id);
  }

  @Get('patients/name/:name')
  @Roles('admin')
  async findPatientByName(
    @Param('name') name: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findPatientByName(name, req.user.company_id);
  }

  @Patch('patients/:id')
  @Roles('admin')
  async updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<UpdatePatientDto>,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.updatePatient(
      id,
      updatePatientDto,
      req.user.company_id,
    );
  }

  @Patch('patients/desactive/:id')
  @Roles('admin')
  async desactivePatient(
    @Param('id') id: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.desactivePatient(id, req.user.company_id);
  }

  @Post('appoiments/create')
  @Roles('admin')
  async createAppoiment(
    @Body() appoimentsDto: CreateAppoimentsDto,
    @Req() req: Request & { user: { user_id: string; company_id: string } },
  ) {
    return this.adminService.createAppoiment(
      appoimentsDto,
      req.user.user_id,
      req.user.company_id,
    );
  }

  @Get('appoiments/stats')
  @Roles('admin')
  async getAppoimentsStats(
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.getAppoimentsStats(req.user.company_id);
  }

  @Get('appoiments')
  @Roles('admin')
  async findAllAppointments(
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findAllAppoiments(req.user.company_id);
  }

  @Get('appoiments/by-date')
  @Roles('admin')
  async findByDate(
    @Query('date') date: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.findByDate(date, req.user.company_id);
  }

  @Get('appoiments/:id')
  @Roles('admin')
  async findAppoimentsById(
    @Param('id') appoiments_id: string,
    @Req() req: Request & { user: RequestUser },
  ) {
    const { user_id, role, company_id } = req.user;
    return this.adminService.findAppoimentsById(
      appoiments_id,
      user_id,
      company_id,
      role,
    );
  }

  @Patch('appoiments/reschedule/:id')
  @Roles('admin')
  async reschedule(
    @Param('id') id: string,
    @Body('dateTime') newDateTime: string,
    @Req() req: Request & { user: RequestUser },
  ) {
    const { user_id, company_id, role } = req.user;
    return this.adminService.reschedule(
      id,
      newDateTime,
      user_id,
      company_id,
      role,
    );
  }

  @Patch('appoiments/:id')
  @Roles('admin')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppoimentsDto: UpdateAppoimentsDto,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.updateAppoiment(
      id,
      updateAppoimentsDto,
      req.user.company_id,
    );
  }

  @Patch('appoiments/cancel/:id')
  @Roles('admin')
  async cancelAppointment(
    @Param('id') id: string,
    @Req() req: Request & { user: { company_id: string } },
  ) {
    return this.adminService.cancelAppoiment(id, req.user.company_id);
  }

  // -------- ROTAS COM :id (GENÉRICAS) — DEIXE POR ÚLTIMO --------
  @Patch(':id')
  @Roles('super_admin')
  async updateAdmin(
    @Param('id') adminId: string,
    @Body() dto: Partial<RegisterAdminDto>,
  ) {
    return this.adminService.updateAdmin(adminId, dto);
  }

  @Post(':id/deactivate')
  @Roles('super_admin')
  async deactivateAdmin(@Param('id') adminId: string) {
    return this.adminService.desactiveAdmin(adminId);
  }

  @Post(':id/reset-password')
  @Roles('super_admin')
  async resetAdminPassword(@Param('id') adminId: string) {
    return this.adminService.resetAdminPassword(adminId);
  }

  @Get(':id')
  @Roles('super_admin')
  async findAdminById(@Param('id') adminId: string) {
    return this.adminService.findAdminById(adminId);
  }
}
