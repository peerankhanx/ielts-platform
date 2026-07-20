import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must include an uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must include a lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must include a number' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'Password must include a special character',
  })
  password: string;
}
