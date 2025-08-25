import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDoctorDto } from '../doctors/dtos/create-doctors.dto';
import { UpdateDoctorDto } from '../doctors/dtos/update-doctors.dto';
import { CreatePatientDto } from '../patient/dtos/create-patient.dto';
import { UpdatePatientDto } from '../patient/dtos/update-patient.dto';
import { CreateAppoimentsDto } from '../appoiments/dtos/create-appoiments.dto';
import { UpdateAppoimentsDto } from '../appoiments/dtos/update-appoiments.dto';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
}

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @Roles('admin')
  async create(@Body() adminDto: CreateAdminDto) {
    return await this.adminService.create(adminDto);
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return await this.adminService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  async findById(@Param('id') id: string) {
    return await this.adminService.findById(id);
  }

  @Patch('desactive/:id')
  @Roles('admin')
  async desactive(@Param('id') id: string) {
    return await this.adminService.desactive(id);
  }
  // Doctor //

  @Post('doctors/create')
  @Roles('admin')
  async createDoctor(@Body() doctorDto: CreateDoctorDto) {
    return await this.adminService.createDoctor(doctorDto);
  }

  @Get('doctors')
  @Roles('admin')
  async findAllDoctors() {
    return await this.adminService.findAllDoctors();
  }

  @Get('doctors/:id')
  @Roles('admin')
  async findDoctorById(@Param('id') id: string) {
    return await this.adminService.findDoctorById(id);
  }

  @Get('doctor/crm/:crm')
  @Roles('admin')
  async findDoctorByCrm(@Param('crm') crm: string) {
    return await this.adminService.findDoctorByCrm(crm);
  }

  @Get('doctor/specialty/:specialty')
  @Roles('admin')
  async findDoctorBySpecialty(@Param('specialty') specialty: string) {
    return await this.adminService.findDoctorBySpecialty(specialty);
  }

  @Get('doctor/name/:name')
  @Roles('admin')
  async findDoctorByName(@Param('name') name: string) {
    return await this.adminService.findDoctorByName(name);
  }

  @Patch('doctor/:id')
  @Roles('admin')
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateDoctorDto: Partial<UpdateDoctorDto>,
  ) {
    return await this.adminService.updateDoctor(id, updateDoctorDto);
  }

  @Patch('doctor/desactive/:id')
  @Roles('admin')
  async desactiveDoctor(@Param('id') id: string) {
    return await this.adminService.desactiveDoctor(id);
  }

  // Patient //

  @Post('patients/create')
  @Roles('admin')
  async createPatient(@Body() patientDto: CreatePatientDto) {
    return await this.adminService.createPatient(patientDto);
  }

  @Get('patients')
  @Roles('admin')
  async findAllPatients() {
    return await this.adminService.findAllPatients();
  }

  @Get('patients/:id')
  @Roles('admin')
  async findPatientById(@Param('id') id: string) {
    return await this.adminService.findPatientById(id);
  }

  @Get('patients/cpf/:cpf')
  @Roles('admin')
  async findPatientByCpf(@Param('cpf') cpf: string) {
    return await this.adminService.findPatientByCpf(cpf);
  }

  @Get('patients/name/:name')
  @Roles('admin')
  async findPatientByName(@Param('name') name: string) {
    return await this.adminService.findPatientByName(name);
  }

  @Patch('patients/:id')
  @Roles('admin')
  async updatePatient(
    @Param('id') id: string,
    @Body() updatePatientDto: Partial<UpdatePatientDto>,
  ) {
    return await this.adminService.UpdatePatient(id, updatePatientDto);
  }

  @Patch('patients/desactive/:id')
  @Roles('admin')
  async desactivePatient(@Param('id') id: string) {
    return await this.adminService.desactivePatient(id);
  }

  // Appoiments //

  @Post('appoiments/create')
  @Roles('admin')
  async createAppointment(
    @Body() appoimentsDto: CreateAppoimentsDto,
    @Body('userId') userId: string,
  ) {
    return await this.adminService.createAppoiment(appoimentsDto, userId);
  }

  @Get('appoiments/stats')
  getAppoimentsStats() {
    return this.adminService.getAppoimentsStats();
  }

  @Get('appoiments')
  @Roles('admin')
  async findAllAppointments() {
    return await this.adminService.findAllAppoiments();
  }

  @Get('appoiments/:id')
  @Roles('doctor', 'patient', 'admin')
  async findAppoimentsById(
    @Param('id') appoiments_id: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    const userRole = user.role;
    return await this.adminService.findAppoimentsById(
      appoiments_id,
      userId,
      userRole,
    );
  }

  @Patch('appoiments/reschedule/:id')
  @Roles('patient')
  async reschedule(
    @Param('id') id: string,
    @Body('dateTime') newDateTime: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    const patientId = user.user_id;
    return await this.adminService.reschedule(id, newDateTime, patientId);
  }
  @Patch('appoiments/:id')
  @Roles('admin')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppoimentsDto: UpdateAppoimentsDto,
  ) {
    return await this.adminService.updateAppoiment(id, updateAppoimentsDto);
  }

  @Patch('appoiments/cancel/:id')
  @Roles('admin')
  async cancelAppointment(@Param('id') id: string) {
    return await this.adminService.cancelAppoiment(id);
  }
}
