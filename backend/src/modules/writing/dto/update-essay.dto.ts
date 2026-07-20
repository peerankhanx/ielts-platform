import { IsString } from 'class-validator';

export class UpdateEssayDto {
  @IsString()
  essayText: string;
}
