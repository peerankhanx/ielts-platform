import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
  IsDefined,
} from 'class-validator';
import { TestDifficulty } from '../../../mock-tests/entities/test.entity';
import { QuestionType } from '../../../reading/entities/question.entity';

class ReadingPassageInputDto {
  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsString()
  title: string;

  @IsString()
  content: string;
}

class ReadingQuestionInputDto {
  // Index into the `passages` array in the parent DTO — resolved to a real
  // passage id by the service after passages are created.
  @IsInt()
  @Min(0)
  passageIndex: number;

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

  // string for MCQ/TFNG, string[] for short-answer's acceptable variants.
  // No stricter type decorator since class-validator doesn't cleanly express
  // "string | string[]" — @IsDefined() is enough to pass the whitelist check.
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

export class CreateReadingTestDto {
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
  @Type(() => ReadingPassageInputDto)
  passages: ReadingPassageInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadingQuestionInputDto)
  questions: ReadingQuestionInputDto[];
}

export class UpdateTestMetaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([true, false])
  isPublished?: boolean;
}
