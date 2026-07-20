import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Test, ModuleType } from '../mock-tests/entities/test.entity';
import { ReadingPassage } from './entities/reading-passage.entity';
import { Question, QuestionType } from './entities/question.entity';
import { TestAttempt, AttemptStatus } from './entities/test-attempt.entity';
import { Answer } from './entities/answer.entity';
import { scoreToBand } from './utils/band-score.util';
import { StudentsService } from '../students/students.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class ReadingService {
  constructor(
    @InjectRepository(Test) private readonly testRepo: Repository<Test>,
    @InjectRepository(ReadingPassage)
    private readonly passageRepo: Repository<ReadingPassage>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(TestAttempt)
    private readonly attemptRepo: Repository<TestAttempt>,
    @InjectRepository(Answer) private readonly answerRepo: Repository<Answer>,
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listTests() {
    const tests = await this.testRepo.find({
      where: { moduleType: ModuleType.READING, isPublished: true },
      order: { createdAt: 'DESC' },
    });
    return tests.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      timeLimitMinutes: t.timeLimitMinutes,
    }));
  }

  async getTestForTaking(testId: string) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.READING },
    });
    if (!test) throw new NotFoundException('Reading test not found');

    const passages = await this.passageRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });

    const questions = await this.questionRepo.find({
      where: { testId },
      order: { orderIndex: 'ASC' },
    });

    // Never expose correctAnswer/explanation while a student is taking the test.
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      passageId: q.passageId,
      orderIndex: q.orderIndex,
      type: q.type,
      promptText: q.promptText,
      options: q.options,
    }));

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      timeLimitMinutes: test.timeLimitMinutes,
      passages: passages.map((p) => ({
        id: p.id,
        orderIndex: p.orderIndex,
        title: p.title,
        content: p.content,
        wordCount: p.wordCount,
      })),
      questions: safeQuestions,
    };
  }

  async startAttempt(userId: string, testId: string) {
    const test = await this.testRepo.findOne({
      where: { id: testId, moduleType: ModuleType.READING },
    });
    if (!test) throw new NotFoundException('Reading test not found');

    const totalQuestions = await this.questionRepo.count({ where: { testId } });

    const attempt = this.attemptRepo.create({
      userId,
      testId,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
      totalQuestions,
    });
    return this.attemptRepo.save(attempt);
  }

  async saveAnswer(
    attemptId: string,
    userId: string,
    questionId: string,
    responseValue: string | null,
  ) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This attempt has already been submitted');
    }

    const question = await this.questionRepo.findOne({
      where: { id: questionId, testId: attempt.testId },
    });
    if (!question)
      throw new NotFoundException('Question not found in this test');

    let answer = await this.answerRepo.findOne({
      where: { attemptId, questionId },
    });
    if (!answer) {
      answer = this.answerRepo.create({ attemptId, questionId });
    }
    answer.responseValue = responseValue;
    await this.answerRepo.save(answer);

    return { questionId, saved: true };
  }

  async submitAttempt(attemptId: string, userId: string) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This attempt has already been submitted');
    }

    const questions = await this.questionRepo.find({
      where: { testId: attempt.testId },
    });
    const answers = await this.answerRepo.find({ where: { attemptId } });
    const answersByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    let rawScore = 0;

    for (const question of questions) {
      const answer = answersByQuestion.get(question.id);
      const isCorrect = this.grade(question, answer?.responseValue ?? null);
      const pointsAwarded = isCorrect ? question.points : 0;
      rawScore += pointsAwarded;

      if (answer) {
        answer.isCorrect = isCorrect;
        answer.pointsAwarded = pointsAwarded;
        await this.answerRepo.save(answer);
      } else {
        await this.answerRepo.save(
          this.answerRepo.create({
            attemptId,
            questionId: question.id,
            responseValue: null,
            isCorrect: false,
            pointsAwarded: 0,
          }),
        );
      }
    }

    const bandScore = scoreToBand(rawScore, questions.length);

    // Check before saving this attempt, so "was this the first one" is accurate.
    const priorCompletedCount = await this.attemptRepo
      .createQueryBuilder('attempt')
      .innerJoin('attempt.test', 'test')
      .where('attempt.userId = :userId', { userId })
      .andWhere('attempt.status = :status', { status: AttemptStatus.COMPLETED })
      .andWhere('test.moduleType = :moduleType', {
        moduleType: ModuleType.READING,
      })
      .getCount();

    attempt.status = AttemptStatus.COMPLETED;
    attempt.submittedAt = new Date();
    attempt.rawScore = rawScore;
    attempt.bandScore = bandScore;
    await this.attemptRepo.save(attempt);

    // Reflect the new reading band on the student's profile (best-effort).
    await this.studentsService.updateReadingBand(userId, bandScore);

    await this.notificationsService.create(
      userId,
      NotificationType.TEST,
      'Reading test completed',
      `You scored ${rawScore}/${questions.length} — an estimated band of ${bandScore.toFixed(1)}.`,
    );

    if (priorCompletedCount === 0) {
      await this.notificationsService.create(
        userId,
        NotificationType.ACHIEVEMENT,
        'First Reading test completed! 🎉',
        'You completed your first Reading practice test. Keep it up!',
      );
    }

    return this.getResult(attemptId, userId);
  }

  async getResult(attemptId: string, userId: string) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);

    const questions = await this.questionRepo.find({
      where: { testId: attempt.testId },
      order: { orderIndex: 'ASC' },
    });
    const answers = await this.answerRepo.find({ where: { attemptId } });
    const answersByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    const breakdown = questions.map((q) => {
      const answer = answersByQuestion.get(q.id);
      return {
        questionId: q.id,
        promptText: q.promptText,
        type: q.type,
        yourAnswer: answer?.responseValue ?? null,
        correctAnswer:
          attempt.status === AttemptStatus.COMPLETED
            ? q.correctAnswer
            : undefined,
        isCorrect: answer?.isCorrect ?? null,
        explanation:
          attempt.status === AttemptStatus.COMPLETED
            ? q.explanation
            : undefined,
      };
    });

    return {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      rawScore: attempt.rawScore,
      totalQuestions: attempt.totalQuestions,
      bandScore: attempt.bandScore,
      breakdown,
    };
  }

  // ---------------------------------------------------------------------

  private async getOwnedAttempt(
    attemptId: string,
    userId: string,
  ): Promise<TestAttempt> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new ForbiddenException('This attempt does not belong to you');
    return attempt;
  }

  private grade(question: Question, responseValue: string | null): boolean {
    if (responseValue === null || responseValue.trim() === '') return false;

    const normalized = responseValue.trim().toLowerCase();

    if (question.type === QuestionType.SHORT_ANSWER) {
      const acceptable = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      return acceptable.some((a) => a.trim().toLowerCase() === normalized);
    }

    // MULTIPLE_CHOICE, TRUE_FALSE_NOT_GIVEN, MATCHING_HEADING all store a single correct string.
    const correct = Array.isArray(question.correctAnswer)
      ? question.correctAnswer[0]
      : question.correctAnswer;
    return correct.trim().toLowerCase() === normalized;
  }
}
