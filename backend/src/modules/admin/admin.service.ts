import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserStatus } from '../users/entities/user.entity';
import { RoleName } from '../users/entities/role.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { Test, ModuleType } from '../mock-tests/entities/test.entity';
import {
  TestAttempt,
  AttemptStatus,
} from '../reading/entities/test-attempt.entity';
import { WritingTask } from '../writing/entities/writing-task.entity';
import {
  WritingSubmission,
  SubmissionStatus as WritingStatus,
} from '../writing/entities/writing-submission.entity';
import { SpeakingTask } from '../speaking/entities/speaking-task.entity';
import {
  SpeakingSubmission,
  SpeakingSubmissionStatus,
} from '../speaking/entities/speaking-submission.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly profileRepo: Repository<StudentProfile>,
    @InjectRepository(Test) private readonly testRepo: Repository<Test>,
    @InjectRepository(TestAttempt)
    private readonly attemptRepo: Repository<TestAttempt>,
    @InjectRepository(WritingTask)
    private readonly writingTaskRepo: Repository<WritingTask>,
    @InjectRepository(WritingSubmission)
    private readonly writingSubmissionRepo: Repository<WritingSubmission>,
    @InjectRepository(SpeakingTask)
    private readonly speakingTaskRepo: Repository<SpeakingTask>,
    @InjectRepository(SpeakingSubmission)
    private readonly speakingSubmissionRepo: Repository<SpeakingSubmission>,
  ) {}

  async getStats() {
    const [totalUsers, totalStudents, totalAdmins] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: { name: RoleName.STUDENT } } }),
      this.userRepo.count({ where: { role: { name: RoleName.ADMIN } } }),
    ]);

    const [readingAttempts, listeningAttempts] = await Promise.all([
      this.attemptRepo.count({
        where: {
          status: AttemptStatus.COMPLETED,
          test: { moduleType: ModuleType.READING },
        },
        relations: { test: true },
      }),
      this.attemptRepo.count({
        where: {
          status: AttemptStatus.COMPLETED,
          test: { moduleType: ModuleType.LISTENING },
        },
        relations: { test: true },
      }),
    ]);

    const [writingSubmissions, speakingSubmissions] = await Promise.all([
      this.writingSubmissionRepo.count({
        where: { status: WritingStatus.EVALUATED },
      }),
      this.speakingSubmissionRepo.count({
        where: { status: SpeakingSubmissionStatus.EVALUATED },
      }),
    ]);

    const avgBandResult = await this.profileRepo
      .createQueryBuilder('profile')
      .select('AVG(profile.currentBand)', 'avg')
      .where('profile.currentBand > 0')
      .getRawOne<{ avg: string | null }>();

    return {
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalAdmins,
      },
      completedAttempts: {
        reading: readingAttempts,
        listening: listeningAttempts,
        writing: writingSubmissions,
        speaking: speakingSubmissions,
      },
      averageCurrentBand: avgBandResult?.avg
        ? Number(parseFloat(avgBandResult.avg).toFixed(1))
        : null,
    };
  }

  async listUsers(page: number, limit: number, search?: string) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where(
        'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [users, total] = await qb.getManyAndCount();

    return {
      items: users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role.name,
        status: u.status,
        emailVerified: u.emailVerified,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.status = status;
    await this.userRepo.save(user);

    return { id: user.id, status: user.status };
  }

  async getContentSummary() {
    const [readingTests, listeningTests, writingTasks, speakingTasks] =
      await Promise.all([
        this.testRepo.count({ where: { moduleType: ModuleType.READING } }),
        this.testRepo.count({ where: { moduleType: ModuleType.LISTENING } }),
        this.writingTaskRepo.count(),
        this.speakingTaskRepo.count(),
      ]);

    return { readingTests, listeningTests, writingTasks, speakingTasks };
  }
}
