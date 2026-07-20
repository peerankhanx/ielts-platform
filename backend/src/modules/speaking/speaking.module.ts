import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeakingTask } from './entities/speaking-task.entity';
import { SpeakingPart } from './entities/speaking-part.entity';
import { SpeakingSubmission } from './entities/speaking-submission.entity';
import { SpeakingResponse } from './entities/speaking-response.entity';
import { SpeakingEvaluation } from './entities/speaking-evaluation.entity';
import { SpeakingService } from './speaking.service';
import { SpeakingController } from './speaking.controller';
import { AudioFluencyEvaluator } from './evaluators/audio-fluency-evaluator';
import { SPEAKING_EVALUATOR } from './evaluators/speaking-evaluator.token';
import { ClaudeSpeakingTextEvaluator } from './evaluators/claude-speaking-text-evaluator';
import { NullTranscriptionProvider } from './transcription/null-transcription-provider';
import { OpenAIWhisperProvider } from './transcription/openai-whisper-provider';
import { TRANSCRIPTION_PROVIDER } from './transcription/transcription-provider.token';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpeakingTask,
      SpeakingPart,
      SpeakingSubmission,
      SpeakingResponse,
      SpeakingEvaluation,
    ]),
    NotificationsModule,
  ],
  controllers: [SpeakingController],
  providers: [
    SpeakingService,
    AudioFluencyEvaluator,
    ClaudeSpeakingTextEvaluator,
    NullTranscriptionProvider,
    OpenAIWhisperProvider,
    { provide: SPEAKING_EVALUATOR, useExisting: AudioFluencyEvaluator },
    {
      provide: TRANSCRIPTION_PROVIDER,
      useFactory: (
        nullProvider: NullTranscriptionProvider,
        openaiProvider: OpenAIWhisperProvider,
      ) => (process.env.OPENAI_API_KEY ? openaiProvider : nullProvider),
      inject: [NullTranscriptionProvider, OpenAIWhisperProvider],
    },
  ],
  exports: [SpeakingService],
})
export class SpeakingModule {}
