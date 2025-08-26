import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AppoimentsService } from './appoiments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminCreateAppoimentDto } from './dtos/admin-create-appoiment.dto';

@Controller('admins/appoiments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAppoimentsController {
  constructor(private readonly service: AppoimentsService) {}

  @Post('create')
  @Roles('admin')
  createAsAdmin(@Body() dto: AdminCreateAppoimentDto) {
    return this.service.createAsAdmin(dto);
  }
}
