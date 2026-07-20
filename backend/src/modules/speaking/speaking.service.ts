import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

import { SpeakingTask } from './entities/speaking-task.entity';
import { SpeakingPart } from './entities/speaking-part.entity';
import {
  SpeakingSubmission,
  SpeakingSubmissionStatus,
} from './entities/speaking-submission.entity';
import { SpeakingResponse } from './entities/speaking-response.entity';
import { SpeakingEvaluation } from './entities/speaking-evaluation.entity';
import { analyzeAudio } from './utils/audio-analysis.util';
import { SPEAKING_EVALUATOR } from './evaluators/speaking-evaluator.token';
import type {
  SpeakingEvaluator,
  SpeakingResponseInput,
} from './evaluators/speaking-evaluator.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { TRANSCRIPTION_PROVIDER } from './transcription/transcription-provider.token';
import type { TranscriptionProvider } from './transcription/transcription-provider.interface';
import { ClaudeSpeakingTextEvaluator } from './evaluators/claude-speaking-text-evaluator';

const AUDIO_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  'uploads',
  'speaking-recordings',
);

@Injectable()
export class SpeakingService {
  constructor(
    @InjectRepository(SpeakingTask)
    private readonly taskRepo: Repository<SpeakingTask>,
    @InjectRepository(SpeakingPart)
    private readonly partRepo: Repository<SpeakingPart>,
    @InjectRepository(SpeakingSubmission)
    private readonly submissionRepo: Repository<SpeakingSubmission>,
    @InjectRepository(SpeakingResponse)
    private readonly responseRepo: Repository<SpeakingResponse>,
    @InjectRepository(SpeakingEvaluation)
    private readonly evaluationRepo: Repository<SpeakingEvaluation>,
    @Inject(SPEAKING_EVALUATOR) private readonly evaluator: SpeakingEvaluator,
    private readonly notificationsService: NotificationsService,
    @Inject(TRANSCRIPTION_PROVIDER)
    private readonly transcriptionProvider: TranscriptionProvider,
    private readonly textEvaluator: ClaudeSpeakingTextEvaluator,
  ) {
    mkdirSync(AUDIO_DIR, { recursive: true });
  }

  async listTasks() {
    const tasks = await this.taskRepo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
    }));
  }

  async getTask(taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Speaking task not found');

    const parts = await this.partRepo.find({
      where: { taskId },
      order: { partNumber: 'ASC' },
    });
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      parts: parts.map((p) => ({
        id: p.id,
        partNumber: p.partNumber,
        promptText: p.promptText,
        cueCardPoints: p.cueCardPoints,
        prepTimeSeconds: p.prepTimeSeconds,
        speakTimeSeconds: p.speakTimeSeconds,
      })),
    };
  }

  async startSubmission(userId: string, taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Speaking task not found');

    const submission = this.submissionRepo.create({
      userId,
      taskId,
      status: SpeakingSubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    return this.submissionRepo.save(submission);
  }

  async uploadResponse(
    submissionId: string,
    userId: string,
    partId: string,
    file: { buffer: Buffer; originalname: string },
  ) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    if (submission.status !== SpeakingSubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'This submission has already been submitted for evaluation',
      );
    }

    const part = await this.partRepo.findOne({
      where: { id: partId, taskId: submission.taskId },
    });
    if (!part)
      throw new NotFoundException('Speaking part not found in this task');

    const ext = extname(file.originalname) || '.webm';
    const filename = `${submissionId}-${partId}${ext}`;
    const filePath = join(AUDIO_DIR, filename);
    writeFileSync(filePath, file.buffer);

    const analysis = analyzeAudio(filePath);

    let response = await this.responseRepo.findOne({
      where: { submissionId, partId },
    });
    if (!response) {
      response = this.responseRepo.create({ submissionId, partId });
    }
    response.audioUrl = `/media/speaking-recordings/${filename}`;
    response.durationSeconds = analysis.durationSeconds;
    response.silenceSeconds = analysis.silenceSeconds;
    response.pauseCount = analysis.pauseCount;
    await this.responseRepo.save(response);

    return {
      partId,
      audioUrl: response.audioUrl,
      durationSeconds: response.durationSeconds,
    };
  }

  async submit(submissionId: string, userId: string) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    if (submission.status !== SpeakingSubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'This submission has already been submitted for evaluation',
      );
    }

    const parts = await this.partRepo.find({
      where: { taskId: submission.taskId },
    });
    const responses = await this.responseRepo.find({ where: { submissionId } });

    if (responses.length === 0) {
      throw new BadRequestException(
        'Record at least one response before submitting',
      );
    }

    submission.status = SpeakingSubmissionStatus.EVALUATING;
    await this.submissionRepo.save(submission);

    const partsById = new Map(parts.map((p) => [p.id, p]));
    const evaluatorInput: SpeakingResponseInput[] = responses.map((r) => ({
      partNumber: partsById.get(r.partId)?.partNumber ?? 0,
      durationSeconds: r.durationSeconds,
      silenceSeconds: r.silenceSeconds,
      pauseCount: r.pauseCount,
      expectedSeconds: partsById.get(r.partId)?.speakTimeSeconds ?? 60,
    }));

    const result = await this.evaluator.evaluate(evaluatorInput);

    // If a real transcription provider is configured, transcribe each
    // response and — when a transcript comes back and Claude is also
    // configured — get real Lexical Resource / Grammatical Range scores
    // from the transcript, upgrading the evaluation beyond fluency-only.
    const transcriptParts: string[] = [];
    for (const response of responses) {
      const audioPath = join(AUDIO_DIR, response.audioUrl.split('/').pop()!);
      const transcript = await this.transcriptionProvider.transcribe(audioPath);
      if (transcript) {
        response.transcript = transcript;
        await this.responseRepo.save(response);
        const partNumber = partsById.get(response.partId)?.partNumber;
        transcriptParts.push(`[Part ${partNumber ?? '?'}] ${transcript}`);
      }
    }

    let lexicalResource = result.lexicalResource;
    let grammaticalRange = result.grammaticalRange;
    let feedback = result.feedback;
    let evaluatorName = result.evaluator;

    if (transcriptParts.length > 0) {
      const task = await this.taskRepo.findOne({
        where: { id: submission.taskId },
      });
      const textResult = await this.textEvaluator.evaluate(
        task?.title ?? 'Speaking task',
        transcriptParts.join('\n\n'),
      );

      if (textResult) {
        lexicalResource = textResult.lexicalResource;
        grammaticalRange = textResult.grammaticalRange;
        feedback = {
          strengths: [...result.feedback.strengths, ...textResult.strengths],
          weaknesses: [...result.feedback.weaknesses, ...textResult.weaknesses],
          suggestions: [
            ...result.feedback.suggestions,
            ...textResult.suggestions,
          ],
        };
        evaluatorName = `${result.evaluator}+claude-text`;
      }
    }

    // Overall band is the average of whichever criteria actually got
    // scored — still honestly partial (Pronunciation is never included;
    // nothing in this project assesses phonemes) rather than a fabricated
    // four-criteria average.
    const scoredCriteria = [
      result.fluencyCoherence,
      lexicalResource,
      grammaticalRange,
    ].filter((v): v is number => v !== null);
    const overallBand =
      scoredCriteria.length > 0
        ? Math.round(
            (scoredCriteria.reduce((sum, v) => sum + v, 0) /
              scoredCriteria.length) *
              2,
          ) / 2
        : null;

    const evaluation = await this.evaluationRepo.save(
      this.evaluationRepo.create({
        submissionId: submission.id,
        fluencyCoherence: result.fluencyCoherence,
        lexicalResource,
        grammaticalRange,
        pronunciation: result.pronunciation,
        overallBand,
        feedback,
        evaluator: evaluatorName,
      }),
    );

    submission.status = SpeakingSubmissionStatus.EVALUATED;
    submission.submittedAt = new Date();
    await this.submissionRepo.save(submission);

    const fluencyText =
      result.fluencyCoherence !== null
        ? ` (Fluency & Coherence: ${result.fluencyCoherence.toFixed(1)})`
        : '';
    await this.notificationsService.create(
      userId,
      NotificationType.AI_EVALUATION,
      'Your Speaking evaluation is ready',
      `Your recording has been analyzed${fluencyText}. Open Speaking to see the full feedback.`,
    );

    return this.toSubmissionResponse(submission, responses, evaluation);
  }

  async getSubmission(submissionId: string, userId: string) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    const responses = await this.responseRepo.find({ where: { submissionId } });
    const evaluation = await this.evaluationRepo.findOne({
      where: { submissionId },
    });
    return this.toSubmissionResponse(submission, responses, evaluation);
  }

  // ---------------------------------------------------------------------

  private async getOwnedSubmission(
    submissionId: string,
    userId: string,
  ): Promise<SpeakingSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.userId !== userId)
      throw new ForbiddenException('This submission does not belong to you');
    return submission;
  }

  private toSubmissionResponse(
    submission: SpeakingSubmission,
    responses: SpeakingResponse[],
    evaluation: SpeakingEvaluation | null,
  ) {
    return {
      id: submission.id,
      taskId: submission.taskId,
      status: submission.status,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      responses: responses.map((r) => ({
        partId: r.partId,
        audioUrl: r.audioUrl,
        durationSeconds: r.durationSeconds,
      })),
      evaluation: evaluation
        ? {
            fluencyCoherence:
              evaluation.fluencyCoherence !== null
                ? Number(evaluation.fluencyCoherence)
                : null,
            lexicalResource:
              evaluation.lexicalResource !== null
                ? Number(evaluation.lexicalResource)
                : null,
            grammaticalRange:
              evaluation.grammaticalRange !== null
                ? Number(evaluation.grammaticalRange)
                : null,
            pronunciation:
              evaluation.pronunciation !== null
                ? Number(evaluation.pronunciation)
                : null,
            overallBand:
              evaluation.overallBand !== null
                ? Number(evaluation.overallBand)
                : null,
            feedback: evaluation.feedback,
            evaluator: evaluation.evaluator,
          }
        : null,
    };
  }
}
