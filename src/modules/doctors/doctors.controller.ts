import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { PatientService } from '../patient/patient.service';
import { CreateDoctorDto } from './dtos/create-doctors.dto';
import { UpdateDoctorDto } from './dtos/update-doctors.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor';
}

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(
    private readonly doctorService: DoctorsService,
    private readonly patientService: PatientService,
  ) {}

  @Post('create')
  @Roles('doctor')
  async create(@Body() doctor: CreateDoctorDto, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    return await this.doctorService.create({ ...doctor, user_id: userId });
  }

  @Get()
  @Roles('doctor')
  async findAll() {
    return await this.doctorService.findAll();
  }

  @Get('by-crm/:crm')
  @Roles('doctor')
  async findByCrm(@Param('crm') crm: string) {
    return await this.doctorService.findByCrm(crm);
  }

  @Get('by-id/:id')
  @Roles('doctor', 'patient')
  async findById(@Param('id') doctor_id: string) {
    return await this.doctorService.findById(doctor_id);
  }

  @Get('by-specialty/:specialty')
  @Roles('doctor', 'patient')
  async findBySpecialty(@Param('specialty') specialty: string) {
    return await this.doctorService.findBySpecialty(specialty);
  }
  @Get('by-cpf/:cpf')
  @Roles('doctor')
  async findByCpf(@Param('cpf') cpf: string) {
    return await this.patientService.findByCpf(cpf);
  }

  @Patch('update/:id')
  @Roles('doctor')
  async update(
    @Param('id') doctor_id: string,
    @Body() doctor: UpdateDoctorDto,
  ) {
    return await this.doctorService.update(doctor_id, doctor);
  }

  @Delete('delete/:id')
  @Roles('doctor')
  async delete(@Param('id') doctor_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    const userRole = user.role;
    return await this.doctorService.delete(doctor_id, userId, userRole);
  }
}
