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
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor';
}

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('create')
  @Roles('doctor', 'patient')
  async create(@Body() patient: CreatePatientDto, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    return await this.patientService.create({ ...patient, user_id: userId });
  }

  @Get('me')
  @Roles('patient')
  async getMe(@Req() req: Request) {
    const user = req.user as RequestUser;
    const patient = await this.patientService.findByUserId(user.user_id);

    if (!patient) {
      throw new HttpException('Patient record not found', HttpStatus.NOT_FOUND);
    }

    return patient;
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return await this.patientService.findAll();
  }

  @Get(':id')
  @Roles('doctor', 'patient')
  async findById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as RequestUser;

    const patient = await this.patientService.findById(id);
    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    if (user.role === 'patient' && patient.user_id !== user.user_id) {
      throw new ForbiddenException(
        'You are not allowed to access this patient record',
      );
    }

    return patient;
  }

  @Patch('update/:id')
  @Roles('doctor', 'patient')
  async update(
    @Param('id') patient_id: string,
    @Body() patient: UpdatePatientDto,
  ) {
    return await this.patientService.update(patient_id, patient);
  }

  @Delete('delete/:id')
  @Roles('doctor', 'patient')
  async delete(@Param('id') patient_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    const userRole = user.role;

    return await this.patientService.delete(patient_id, userId, userRole);
  }
}
