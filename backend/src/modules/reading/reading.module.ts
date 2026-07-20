import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '../mock-tests/entities/test.entity';
import { ReadingPassage } from './entities/reading-passage.entity';
import { Question } from './entities/question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { Answer } from './entities/answer.entity';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      ReadingPassage,
      Question,
      TestAttempt,
      Answer,
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [ReadingController],
  providers: [ReadingService],
  exports: [ReadingService],
})
export class ReadingModule {}
