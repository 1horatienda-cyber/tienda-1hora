import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateWhatsAppNumberDto {
  // Formato internacional, sin "+" (igual que STORE_WHATSAPP_NUMBER): ej. 18298253309
  @IsString()
  @Matches(/^\d{7,15}$/, { message: 'El número debe estar en formato internacional, solo dígitos (sin +)' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  operatorIds?: string[];
}
