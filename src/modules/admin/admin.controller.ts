import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return await this.adminService.delete(id);
  }
}
