import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '../../mock-tests/entities/test.entity';
import { ReadingPassage } from '../../reading/entities/reading-passage.entity';
import { Question } from '../../reading/entities/question.entity';
import { ListeningSection } from '../../listening/entities/listening-section.entity';
import { WritingTask } from '../../writing/entities/writing-task.entity';
import { SpeakingTask } from '../../speaking/entities/speaking-task.entity';
import { SpeakingPart } from '../../speaking/entities/speaking-part.entity';
import { ContentAdminService } from './content-admin.service';
import { ContentAdminController } from './content-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      ReadingPassage,
      Question,
      ListeningSection,
      WritingTask,
      SpeakingTask,
      SpeakingPart,
    ]),
  ],
  controllers: [ContentAdminController],
  providers: [ContentAdminService],
})
export class ContentAdminModule {}
