import { IsUUID } from 'class-validator';

export class CloseConversationDto {
  @IsUUID()
  customerToken: string;
}
