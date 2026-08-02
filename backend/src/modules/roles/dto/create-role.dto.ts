import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ALL_PERMISSION_KEYS, PermissionKey } from '../permissions.constant';

export class CreateRoleDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsArray()
  @IsIn(ALL_PERMISSION_KEYS, { each: true })
  permissions: PermissionKey[];
}
