import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_PROVIDER } from './providers/email-provider.token';
import type {
  EmailProvider,
  SendEmailParams,
} from './providers/email-provider.interface';

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER) private readonly provider: EmailProvider,
  ) {}

  send(params: SendEmailParams): Promise<void> {
    return this.provider.send(params);
  }
}
