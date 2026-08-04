import { IsString, MaxLength, MinLength } from 'class-validator';

// El widget de chat pide nombre y teléfono antes de dejar escribir, así el
// admin sabe quién es y puede darle seguimiento por WhatsApp si hace falta.
export class CreateConversationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  customerName: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  customerPhone: string;
}
