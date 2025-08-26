import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dtos/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor';
  company_id: string;
}

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('me')
  @Roles('patient')
  async getMe(@Req() req: Request) {
    const user = req.user as RequestUser;
    const patient = await this.patientService.findByUserId(
      user.user_id,
      user.company_id,
    );

    if (!patient) {
      throw new HttpException('Patient record not found', HttpStatus.NOT_FOUND);
    }

    return patient;
  }

  @Get()
  @Roles('admin')
  async findAll(@Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.patientService.findAll(user.company_id);
  }

  @Get(':id')
  @Roles('admin', 'patient')
  async findById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as RequestUser;

    const patient = await this.patientService.findById(id, user.company_id);
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
  @Roles('patient', 'admin')
  async update(
    @Param('id') patient_id: string,
    @Body() patient: UpdatePatientDto,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    return await this.patientService.update(
      patient_id,
      patient,
      user.company_id,
    );
  }

  @Patch('desactive/:id')
  @Roles('patient', 'admin')
  async desactive(@Param('id') patient_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.patientService.desactivePatient(
      patient_id,
      user.company_id,
    );
  }
}
