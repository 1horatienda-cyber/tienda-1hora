import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT') || 587,
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Recuperar tu contraseña';
    const text = `Recibimos una solicitud para restablecer tu contraseña.\n\nEntra a este enlace (válido por 1 hora) para elegir una nueva:\n${resetLink}\n\nSi no fuiste tú, ignora este correo.`;

    if (!this.transporter) {
      // No hay SMTP configurado todavía (backend/.env): en vez de fallar, dejamos el
      // enlace en la consola para poder probar el flujo completo en desarrollo.
      // Para enviar correos reales, definí SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM.
      this.logger.warn(
        `SMTP no configurado — enlace de recuperación para ${to}:\n${resetLink}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') || 'no-reply@tienda.local',
      to,
      subject,
      text,
    });
  }
}
