import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConsoleEmailProvider } from './providers/console-email-provider';
import { SmtpEmailProvider } from './providers/smtp-email-provider';
import { EMAIL_PROVIDER } from './providers/email-provider.token';

@Module({
  providers: [
    EmailService,
    ConsoleEmailProvider,
    SmtpEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      useFactory: (
        consoleProvider: ConsoleEmailProvider,
        smtpProvider: SmtpEmailProvider,
      ) => (process.env.SMTP_HOST ? smtpProvider : consoleProvider),
      inject: [ConsoleEmailProvider, SmtpEmailProvider],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
