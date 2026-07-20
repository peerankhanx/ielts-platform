import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { Test } from '../mock-tests/entities/test.entity';
import { TestAttempt } from '../reading/entities/test-attempt.entity';
import { WritingTask } from '../writing/entities/writing-task.entity';
import { WritingSubmission } from '../writing/entities/writing-submission.entity';
import { SpeakingTask } from '../speaking/entities/speaking-task.entity';
import { SpeakingSubmission } from '../speaking/entities/speaking-submission.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StudentProfile,
      Test,
      TestAttempt,
      WritingTask,
      WritingSubmission,
      SpeakingTask,
      SpeakingSubmission,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
