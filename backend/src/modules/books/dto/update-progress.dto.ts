import { IsInt, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  lastPageRead?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
