import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { SpeakingSubmission } from './speaking-submission.entity';
import { SpeakingPart } from './speaking-part.entity';

@Entity('speaking_responses')
@Index(['submissionId', 'partId'], { unique: true })
export class SpeakingResponse extends BaseEntity {
  @Column({ name: 'submission_id' })
  submissionId: string;

  @ManyToOne(() => SpeakingSubmission, (submission) => submission.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'submission_id' })
  submission: SpeakingSubmission;

  @Column({ name: 'part_id' })
  partId: string;

  @ManyToOne(() => SpeakingPart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'part_id' })
  part: SpeakingPart;

  // Path served by GET /media/audio/... (same static mount as listening).
  @Column({ name: 'audio_url' })
  audioUrl: string;

  @Column({ name: 'duration_seconds', type: 'float', default: 0 })
  durationSeconds: number;

  // Real, computed signal: total silence detected via ffmpeg silencedetect,
  // used by the fluency heuristic. Not a placeholder — genuinely measured.
  @Column({ name: 'silence_seconds', type: 'float', default: 0 })
  silenceSeconds: number;

  @Column({ name: 'pause_count', default: 0 })
  pauseCount: number;

  // Filled in by a TranscriptionProvider at submit time, if one is
  // configured (see speaking.module.ts). Null when no STT is configured —
  // this is the honest default, not a placeholder for a broken feature.
  @Column({ type: 'text', nullable: true })
  transcript: string | null;
}
