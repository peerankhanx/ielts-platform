import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsDefined,
} from 'class-validator';
import { TestDifficulty } from '../../../mock-tests/entities/test.entity';
import { QuestionType } from '../../../reading/entities/question.entity';

class ListeningSectionInputDto {
  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  title: string;
}

class ListeningQuestionInputDto {
  @IsInt()
  @Min(0)
  sectionIndex: number;

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

export class CreateListeningTestDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TestDifficulty)
  difficulty?: TestDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningSectionInputDto)
  sections: ListeningSectionInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningQuestionInputDto)
  questions: ListeningQuestionInputDto[];
}
