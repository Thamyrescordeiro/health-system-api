import { Module } from '@nestjs/common';
import { EmailService } from '../Email/email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
