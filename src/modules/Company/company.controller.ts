import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async createCompany(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async searchCompanies(@Query('q') query: string) {
    return this.companyService.searchByName(query);
  }

  @Patch('/:companyId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async deactivateCompany(@Param('companyId') companyId: string) {
    return this.companyService.deactivateCompany(companyId);
  }

  @Patch('/:companyId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  async activateCompany(@Param('companyId') companyId: string) {
    return this.companyService.activateCompany(companyId);
  }
}
