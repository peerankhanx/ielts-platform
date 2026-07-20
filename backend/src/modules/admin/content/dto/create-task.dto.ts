import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { WritingTaskType } from '../../../writing/entities/writing-task.entity';

export class CreateWritingTaskDto {
  @IsString()
  title: string;

  @IsEnum(WritingTaskType)
  taskType: WritingTaskType;

  @IsString()
  promptText: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  minWords: number;

  @IsInt()
  @Min(1)
  timeLimitMinutes: number;
}

class SpeakingPartInputDto {
  @IsInt()
  @Min(1)
  partNumber: number;

  @IsString()
  promptText: string;

  @IsOptional()
  @IsArray()
  cueCardPoints?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeSeconds?: number;

  @IsInt()
  @Min(1)
  speakTimeSeconds: number;
}

export class CreateSpeakingTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeakingPartInputDto)
  parts: SpeakingPartInputDto[];
}
