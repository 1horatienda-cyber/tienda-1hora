import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '../entities/inventory-movement.entity';

export class RegisterMovementDto {
  @IsUUID()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
