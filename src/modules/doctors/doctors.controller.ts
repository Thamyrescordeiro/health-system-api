import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { PatientService } from '../patient/patient.service';
import { UpdateDoctorDto } from './dtos/update-doctors.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
  company_id: string;
}

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(
    private readonly doctorService: DoctorsService,
    private readonly patientService: PatientService,
  ) {}

  @Get()
  @Roles('doctor', 'admin')
  async findAll(@Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.doctorService.findAll(user.company_id);
  }

  @Get('by-crm/:crm')
  @Roles('doctor', 'admin')
  async findByCrm(@Param('crm') crm: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.doctorService.findByCrm(crm, user.company_id);
  }

  @Get('by-id/:id')
  @Roles('doctor', 'admin')
  async findById(@Param('id') doctor_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.doctorService.findById(doctor_id, user.company_id);
  }

  @Get('by-specialty/:specialty')
  @Roles('doctor', 'patient', 'admin')
  async findBySpecialty(
    @Param('specialty') specialty: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    return await this.doctorService.findBySpecialty(specialty, user.company_id);
  }

  @Get('specialties')
  @Roles('doctor', 'patient', 'admin')
  async getSpecialties(@Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.doctorService.findAllSpecialties(user.company_id);
  }

  @Patch('update/:id')
  @Roles('doctor', 'admin')
  async update(
    @Param('id') doctor_id: string,
    @Body() doctor: UpdateDoctorDto,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    return await this.doctorService.update(doctor_id, doctor, user.company_id);
  }

  @Patch('deactivate/:id')
  @Roles('doctor', 'admin')
  async deactivate(@Param('id') doctor_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.doctorService.desactiveDoctor(doctor_id, user.company_id);
  }
}
