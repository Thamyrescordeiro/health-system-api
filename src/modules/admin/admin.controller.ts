import {
  BadRequestException,
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
import { AdminService } from './admin.service';
import { CreateCompanyDto } from '../Company/dtos/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';
import { CreateAppoimentsDto } from '../appoiments/dtos/create-appoiments.dto';
import { UpdateAppoimentsDto } from '../appoiments/dtos/update-appoiments.dto';
import { Request } from '@nestjs/common';
import { EmailService } from '../../Email/email.service';
import { RegisterAdminDto } from '../auth/dtos/register-admin.dto';
import { Company } from '../Company/company.entity';
import { InjectModel } from '@nestjs/sequelize';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
  companyId: string;
}

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
    @InjectModel(Company) private readonly companyModel: typeof Company,
  ) {}

  // Admin//

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async updateAdmin(
    @Param('id') adminId: string,
    @Body() dto: Partial<RegisterAdminDto>,
  ) {
    return this.adminService.updateAdmin(adminId, dto);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async deactivateAdmin(@Param('id') adminId: string) {
    return this.adminService.desactiveAdmin(adminId);
  }

  @Post(':id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async resetAdminPassword(@Param('id') adminId: string) {
    return this.adminService.resetAdminPassword(adminId);
  }

  @Get()
  @Roles('super_admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAllAdmins() {
    return this.adminService.findAllAdmins();
  }

  @Get('company/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async listAdmins(@Param('companyId') companyId: string) {
    return this.adminService.listAdminsByCompany(companyId);
  }

  // Companies //
  @Get('companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async findAllCompanies() {
    return this.adminService.findAllCompanies();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('invite')
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

  @Post('create/companies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async createCompany(@Body() dto: CreateCompanyDto) {
    return this.adminService.createCompany(dto);
  }

  @Patch('companies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async updateCompany(@Param('id') id: string, @Body() dto: CreateCompanyDto) {
    return this.adminService.updateCompany(id, dto);
  }

  @Post('companies/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async deactivateCompany(@Param('id') id: string) {
    return this.adminService.deactivateCompany(id);
  }
  // Doctor //

  @Get('doctors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllDoctors(@Query('companyId') companyId: string) {
    return await this.adminService.findAllDoctors(companyId);
  }

  @Get('doctors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findDoctorById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findDoctorById(id, companyId);
  }

  @Get('doctor/crm/:crm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findDoctorByCrm(
    @Param('crm') crm: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findDoctorByCrm(crm, companyId);
  }

  @Get('doctor/specialty/:specialty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findDoctorBySpecialty(
    @Param('specialty') specialty: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findDoctorBySpecialty(specialty, companyId);
  }

  @Get('doctor/name/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findDoctorByName(
    @Param('name') name: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findDoctorByName(name, companyId);
  }

  @Patch('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateDoctorDto: Partial<UpdateDoctorDto>,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.updateDoctor(id, updateDoctorDto, companyId);
  }

  @Patch('doctor/desactive/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async desactiveDoctor(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.desactiveDoctor(id, companyId);
  }
  // Patient //

  @Get('patients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllPatients(@Query('companyId') companyId: string) {
    return await this.adminService.findAllPatients(companyId);
  }

  @Get('patients/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findPatientById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findPatientById(id, companyId);
  }

  @Get('patients/cpf/:cpf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findPatientByCpf(
    @Param('cpf') cpf: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findPatientByCpf(cpf, companyId);
  }

  @Get('patients/name/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findPatientByName(
    @Param('name') name: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.findPatientByName(name, companyId);
  }

  @Patch('patients/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<UpdatePatientDto>,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.updatePatient(
      id,
      updatePatientDto,
      companyId,
    );
  }

  @Patch('patients/desactive/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async desactivePatient(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.desactivePatient(id, companyId);
  }

  // Appoiments //

  @Post('appoiments/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createAppointment(
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAppoimentsStats(@Query('companyId') companyId: string) {
    return await this.adminService.getAppoimentsStats(companyId);
  }

  @Get('appoiments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllAppointments(@Query('companyId') companyId: string) {
    return await this.adminService.findAllAppoiments(companyId);
  }

  @Get('appoiments/by-date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findByDate(
    @Query('date') date: string,
    @Query('companyId') companyId: string,
  ) {
    return this.adminService.findByDate(date, companyId);
  }

  @Get('appoiments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAppoimentsById(
    @Param('id') appoiments_id: string,
    @Req() req: Request & { user: RequestUser },
    @Query('companyId') companyId: string,
  ) {
    const user = req.user;
    const userId = user.user_id;
    const userRole = user.role;
    return await this.adminService.findAppoimentsById(
      appoiments_id,
      userId,
      companyId,
      userRole,
    );
  }

  @Patch('appoiments/reschedule/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reschedule(
    @Param('id') id: string,
    @Body('dateTime') newDateTime: string,
    @Req() req: Request & { user: RequestUser },
    @Query('companyId') companyId: string,
  ) {
    const user = req.user;
    const patientId = user.user_id;
    return await this.adminService.reschedule(
      id,
      newDateTime,
      patientId,
      companyId,
    );
  }
  @Patch('appoiments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppoimentsDto: UpdateAppoimentsDto,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.updateAppoiment(
      id,
      updateAppoimentsDto,
      companyId,
    );
  }

  @Patch('appoiments/cancel/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async cancelAppointment(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return await this.adminService.cancelAppoiment(id, companyId);
  }

  @Get('appoiments/doctors/:doctorId/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async availabilityByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('companyId') companyId: string,
  ) {
    if (!date) {
      throw new BadRequestException(
        'query param "date" (YYYY-MM-DD) é obrigatório',
      );
    }
    return this.adminService.findAvailableByDoctor(doctorId, date, companyId);
  }
}
