import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SaveAnswerDto {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsString()
  responseValue: string | null;
}
