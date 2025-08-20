import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<nodemailer.SentMessageInfo> {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  }
}
