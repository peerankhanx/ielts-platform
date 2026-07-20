import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '../mock-tests/entities/test.entity';
import { ListeningSection } from './entities/listening-section.entity';
import { Question } from '../reading/entities/question.entity';
import { TestAttempt } from '../reading/entities/test-attempt.entity';
import { Answer } from '../reading/entities/answer.entity';
import { ListeningService } from './listening.service';
import { ListeningController } from './listening.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      ListeningSection,
      Question,
      TestAttempt,
      Answer,
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [ListeningController],
  providers: [ListeningService],
  exports: [ListeningService],
})
export class ListeningModule {}
