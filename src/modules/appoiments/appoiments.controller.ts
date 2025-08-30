import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppoimentsService } from './appoiments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { CreateAppoimentsDto } from './dtos/create-appoiments.dto';

interface RequestUser {
  user_id: string;
  role: 'patient' | 'doctor' | 'admin';
  company_id: string;
}

@Controller('appoiments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppoimentsController {
  constructor(private readonly appoimentsService: AppoimentsService) {}

  @Post('create')
  @Roles('patient')
  async create(@Body() appoiment: CreateAppoimentsDto, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.create(
      appoiment,
      user.user_id,
      user.company_id,
    );
  }

  @Get('doctors')
  @Roles('patient', 'admin', 'doctor')
  async listDoctors(
    @Req() req: Request,
    @Query('specialty') specialty?: string,
    @Query('q') q?: string,
  ) {
    const user = req.user as RequestUser;
    return this.appoimentsService.listDoctors(user.company_id, {
      specialty,
      q,
    });
  }

  @Get('by-date/:date')
  @Roles('doctor', 'patient', 'admin')
  async findByDate(@Param('date') date: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.findByDate(date, user.company_id);
  }

  @Get('by-cpf/:cpf')
  @Roles('doctor', 'admin')
  async findByCpf(@Param('cpf') cpf: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.findByCpf(cpf, user.company_id);
  }

  @Get('my-appoiments')
  @Roles('patient', 'admin')
  async findMyPatientAppoiments(@Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.findByPatient(
      user.user_id,
      user.company_id,
    );
  }

  @Get('my-doctor-appoiments')
  @Roles('doctor', 'admin')
  async findMyDoctorAppoiments(@Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.findByDoctor(
      user.user_id,
      user.company_id,
    );
  }
  @Get('doctors/:id/availability')
  @Roles('doctor', 'patient', 'admin')
  async getDoctorAvailability(
    @Param('id') doctorId: string,
    @Query('date') date: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    return this.appoimentsService.findAvailableByDoctor(
      doctorId,
      date,
      user.company_id,
    );
  }
  @Get(':id')
  @Roles('doctor', 'patient', 'admin')
  async findById(@Param('id') appoiments_id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.findById(
      appoiments_id,
      user.user_id,
      user.company_id,
      user.role,
    );
  }

  @Patch('reschedule/:id')
  @Roles('patient')
  async reschedule(
    @Param('id') id: string,
    @Body('dateTime') newDateTime: string,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    return await this.appoimentsService.reschedule(
      id,
      new Date(newDateTime),
      user.user_id,
    );
  }

  @Patch('cancel/:id')
  @Roles('patient')
  async cancel(@Param('id') id: string, @Req() req: Request) {
    const { company_id } = req.user as RequestUser;
    return this.appoimentsService.cancelAppoiment(id, company_id);
  }
}
