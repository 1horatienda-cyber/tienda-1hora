import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordWithTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
