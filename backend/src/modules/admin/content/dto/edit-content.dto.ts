import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  IsDefined,
  IsUUID,
} from 'class-validator';
import { QuestionType } from '../../../reading/entities/question.entity';

export class UpsertQuestionDto {
  @IsOptional()
  @IsUUID()
  passageId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  promptText: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsDefined()
  correctAnswer: string | string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class UpdatePassageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class CreatePassageDto {
  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsString()
  title?: string;
}

export class CreateSectionDto {
  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  title: string;
}
