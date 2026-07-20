import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WritingTask } from './entities/writing-task.entity';
import {
  WritingSubmission,
  SubmissionStatus,
} from './entities/writing-submission.entity';
import { WritingEvaluation } from './entities/writing-evaluation.entity';
import { WRITING_EVALUATOR } from './evaluators/writing-evaluator.token';
import type { WritingEvaluator } from './evaluators/writing-evaluator.interface';
import { StudentsService } from '../students/students.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

@Injectable()
export class WritingService {
  constructor(
    @InjectRepository(WritingTask)
    private readonly taskRepo: Repository<WritingTask>,
    @InjectRepository(WritingSubmission)
    private readonly submissionRepo: Repository<WritingSubmission>,
    @InjectRepository(WritingEvaluation)
    private readonly evaluationRepo: Repository<WritingEvaluation>,
    @Inject(WRITING_EVALUATOR) private readonly evaluator: WritingEvaluator,
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listTasks() {
    const tasks = await this.taskRepo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      taskType: t.taskType,
      minWords: t.minWords,
      timeLimitMinutes: t.timeLimitMinutes,
    }));
  }

  async getTask(taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Writing task not found');
    return task;
  }

  async startSubmission(userId: string, taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Writing task not found');

    const submission = this.submissionRepo.create({
      userId,
      taskId,
      essayText: '',
      wordCount: 0,
      status: SubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    return this.submissionRepo.save(submission);
  }

  async updateEssay(submissionId: string, userId: string, essayText: string) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'This submission has already been submitted for evaluation',
      );
    }

    submission.essayText = essayText;
    submission.wordCount = countWords(essayText);
    await this.submissionRepo.save(submission);

    return { wordCount: submission.wordCount, saved: true };
  }

  async submit(submissionId: string, userId: string) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    if (submission.status !== SubmissionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'This submission has already been submitted for evaluation',
      );
    }
    if (submission.wordCount === 0) {
      throw new BadRequestException('Write your essay before submitting');
    }

    const task = await this.taskRepo.findOne({
      where: { id: submission.taskId },
    });
    if (!task) throw new NotFoundException('Writing task not found');

    submission.status = SubmissionStatus.EVALUATING;
    submission.submittedAt = new Date();
    await this.submissionRepo.save(submission);

    const result = await this.evaluator.evaluate({
      promptText: task.promptText,
      essayText: submission.essayText,
      minWords: task.minWords,
    });

    const evaluation = await this.evaluationRepo.save(
      this.evaluationRepo.create({
        submissionId: submission.id,
        taskAchievement: result.taskAchievement,
        coherenceCohesion: result.coherenceCohesion,
        lexicalResource: result.lexicalResource,
        grammaticalRange: result.grammaticalRange,
        overallBand: result.overallBand,
        feedback: result.feedback,
        evaluator: result.evaluator,
      }),
    );

    submission.status = SubmissionStatus.EVALUATED;
    await this.submissionRepo.save(submission);

    await this.studentsService.updateWritingBand(userId, result.overallBand);

    await this.notificationsService.create(
      userId,
      NotificationType.AI_EVALUATION,
      'Your Writing evaluation is ready',
      `Your essay scored an overall band of ${result.overallBand.toFixed(1)}. Open Writing to see the full breakdown and feedback.`,
    );

    return this.toSubmissionResponse(submission, evaluation);
  }

  async getSubmission(submissionId: string, userId: string) {
    const submission = await this.getOwnedSubmission(submissionId, userId);
    const evaluation = await this.evaluationRepo.findOne({
      where: { submissionId },
    });
    return this.toSubmissionResponse(submission, evaluation);
  }

  // ---------------------------------------------------------------------

  private async getOwnedSubmission(
    submissionId: string,
    userId: string,
  ): Promise<WritingSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.userId !== userId)
      throw new ForbiddenException('This submission does not belong to you');
    return submission;
  }

  private toSubmissionResponse(
    submission: WritingSubmission,
    evaluation: WritingEvaluation | null,
  ) {
    return {
      id: submission.id,
      taskId: submission.taskId,
      essayText: submission.essayText,
      wordCount: submission.wordCount,
      status: submission.status,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      evaluation: evaluation
        ? {
            taskAchievement: Number(evaluation.taskAchievement),
            coherenceCohesion: Number(evaluation.coherenceCohesion),
            lexicalResource: Number(evaluation.lexicalResource),
            grammaticalRange: Number(evaluation.grammaticalRange),
            overallBand: Number(evaluation.overallBand),
            feedback: evaluation.feedback,
            evaluator: evaluation.evaluator,
          }
        : null,
    };
  }
}
