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

  @Get()
  @Roles('doctor')
  async findAll() {
    return await this.patientService.findAll();
  }

  @Get(':id')
  @Roles('doctor', 'patient')
  async findById(@Param('id') id: string) {
    return await this.patientService.findById(id);
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
