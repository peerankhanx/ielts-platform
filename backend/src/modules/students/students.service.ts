import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly profileRepo: Repository<StudentProfile>,
  ) {}

  createProfile(userId: string): Promise<StudentProfile> {
    const profile = this.profileRepo.create({ userId });
    return this.profileRepo.save(profile);
  }

  async updateReadingBand(userId: string, bandScore: number): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return; // best-effort; profile should exist for all students

    // Simple running estimate: nudge current overall band toward the new
    // reading band rather than overwrite it outright, since overall band
    // should reflect all four skills, not just the latest reading result.
    profile.currentBand = Number(
      ((Number(profile.currentBand) + bandScore) / 2).toFixed(1),
    );
    await this.profileRepo.save(profile);
  }

  async updateListeningBand(userId: string, bandScore: number): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return;

    profile.currentBand = Number(
      ((Number(profile.currentBand) + bandScore) / 2).toFixed(1),
    );
    await this.profileRepo.save(profile);
  }

  async updateWritingBand(userId: string, bandScore: number): Promise<void> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) return;

    profile.currentBand = Number(
      ((Number(profile.currentBand) + bandScore) / 2).toFixed(1),
    );
    await this.profileRepo.save(profile);
  }
}
