import { Injectable, Logger } from '@nestjs/common';
import type {
  EmailProvider,
  SendEmailParams,
} from './email-provider.interface';

/**
 * Logs the email instead of sending it — the default provider whenever SMTP
 * isn't configured. This is what every verification/reset email has gone
 * through so far in this project; formalizing it as a real provider (rather
 * than an inline console.log in AuthService) is what makes it possible to
 * queue emails through BullMQ and swap in real SMTP later without touching
 * the call sites in AuthService.
 */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console';
  private readonly logger = new Logger('Email');

  send(params: SendEmailParams): Promise<void> {
    this.logger.log(
      `[dev] To: ${params.to} | Subject: ${params.subject}\n${params.text}`,
    );
    return Promise.resolve();
  }
}
