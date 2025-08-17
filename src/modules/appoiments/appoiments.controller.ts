import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppoimentsService } from './appoiments.service';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor';
}

@Controller('appoiments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppoimentsController {
  constructor(private readonly appoimentsService: AppoimentsService) {}

  @Post('create')
  @Roles('patient')
  async create(@Body() appoiment: CreateAppoimentsDto, @Req() req: Request) {
    const user = req.user as RequestUser;
    const patientId = user.user_id;
    return await this.appoimentsService.create(appoiment, patientId);
  }

  @Get(':id')
  @Roles('doctor', 'patient')
  async findById(@Param('id') appoiments_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    const userRole = user.role;
    return await this.appoimentsService.findById(
      appoiments_id,
      userId,
      userRole,
    );
  }

  @Get('by-date/:date')
  @Roles('doctor', 'patient')
  async findByDate(@Param('date') date: string) {
    return await this.appoimentsService.findByDate(date);
  }

  @Get('by-cpf/:cpf')
  @Roles('doctor')
  async findByCpf(@Param('cpf') cpf: string) {
    return await this.appoimentsService.findByCpf(cpf);
  }

  @Get('my-appoiments')
  @Roles('patient')
  async findMyPatientAppoiments(@Req() req: Request) {
    const user = req.user as RequestUser;
    const patientId = user.user_id;
    return await this.appoimentsService.findByPatient(patientId);
  }

  @Get('my-doctor-appoiments')
  @Roles('doctor')
  async findMyDoctorAppoiments(@Req() req: Request) {
    const user = req.user as RequestUser;
    const doctorId = user.user_id;
    return await this.appoimentsService.findByDoctor(doctorId);
  }

  @Get('doctors/:id/availability')
  async getDoctorAvailability(
    @Param('id') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appoimentsService.findAvailableByDoctor(doctorId, date);
  }

  @Delete('cancel/:id')
  @Roles('patient', 'doctor')
  async cancel(@Param('id') appoiments_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    const userId = user.user_id;
    const userRole = user.role;
    return await this.appoimentsService.delete(appoiments_id, userId, userRole);
  }

  @Patch('reschedule/:id')
  @Roles('patient')
  async reschedule(
    @Param('id') id: string,
    @Body('dateTime') newDateTime: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    const patientId = user.user_id;
    return await this.appoimentsService.reschedule(id, newDateTime, patientId);
  }
}
