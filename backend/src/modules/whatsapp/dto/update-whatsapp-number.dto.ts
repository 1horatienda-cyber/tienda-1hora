import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { WhatsAppNumberStatus } from '../entities/whatsapp-number.entity';

export class UpdateWhatsAppNumberDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{7,15}$/, { message: 'El número debe estar en formato internacional, solo dígitos (sin +)' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(WhatsAppNumberStatus)
  status?: WhatsAppNumberStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  operatorIds?: string[];
}
