import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

// Usado por el cliente (público): además del mensaje, manda el token
// de su conversación para probar que es el dueño de ese chat.
export class SendMessageDto {
  @IsUUID()
  customerToken: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
