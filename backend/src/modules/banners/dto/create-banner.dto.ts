import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  href?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
