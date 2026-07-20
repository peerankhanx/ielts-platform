import { Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type {
  EmailProvider,
  SendEmailParams,
} from './email-provider.interface';

/**
 * Real SMTP delivery via nodemailer. Only active when SMTP_HOST is set (see
 * email.module.ts's provider factory) — otherwise ConsoleEmailProvider
 * handles it. This could not be tested in this sandbox: there's no SMTP
 * relay reachable from here (the network allowlist covers package
 * registries and source hosting, not mail servers), so this is written
 * correctly against nodemailer's documented API but unverified end-to-end.
 */
@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
    return this.transporter;
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? 'Bandwise <no-reply@bandwise.dev>',
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
  }
}
