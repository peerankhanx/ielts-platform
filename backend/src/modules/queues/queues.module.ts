import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from '../email/email.module';
import { EmailProcessor } from './email.processor';
import { QueueService } from './queue.service';
import { EMAIL_QUEUE } from './email-job.interface';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE }), EmailModule],
  providers: [EmailProcessor, QueueService],
  exports: [QueueService],
})
export class QueuesModule {}
