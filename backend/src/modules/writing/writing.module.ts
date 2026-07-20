import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WritingTask } from './entities/writing-task.entity';
import { WritingSubmission } from './entities/writing-submission.entity';
import { WritingEvaluation } from './entities/writing-evaluation.entity';
import { WritingService } from './writing.service';
import { WritingController } from './writing.controller';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { HeuristicWritingEvaluator } from './evaluators/heuristic-writing-evaluator';
import { ClaudeWritingEvaluator } from './evaluators/claude-writing-evaluator';
import { WRITING_EVALUATOR } from './evaluators/writing-evaluator.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WritingTask,
      WritingSubmission,
      WritingEvaluation,
    ]),
    StudentsModule,
    NotificationsModule,
  ],
  controllers: [WritingController],
  providers: [
    WritingService,
    HeuristicWritingEvaluator,
    ClaudeWritingEvaluator,
    {
      provide: WRITING_EVALUATOR,
      useFactory: (
        heuristic: HeuristicWritingEvaluator,
        claude: ClaudeWritingEvaluator,
      ) => (process.env.ANTHROPIC_API_KEY ? claude : heuristic),
      inject: [HeuristicWritingEvaluator, ClaudeWritingEvaluator],
    },
  ],
  exports: [WritingService],
})
export class WritingModule {}
