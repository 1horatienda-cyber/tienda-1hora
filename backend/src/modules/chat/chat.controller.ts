import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AdminSendMessageDto } from './dto/admin-send-message.dto';
import { CloseConversationDto } from './dto/close-conversation.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  // --- Público: usado por el widget de chat de la tienda ---

  @Post('conversations')
  createConversation(@Body() dto: CreateConversationDto) {
    return this.service.createConversation(dto);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.service.sendCustomerMessage(id, dto.customerToken, dto.content);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @Query('customerToken') customerToken?: string) {
    return this.service.getMessagesForCustomer(id, customerToken);
  }

  // El cliente termina su conversación desde el widget (botón "Finalizar chat").
  // Al volver a abrir el chat, se le pide nombre y teléfono de nuevo y arranca una conversación nueva.
  @Patch('conversations/:id/close')
  closeConversation(@Param('id') id: string, @Body() dto: CloseConversationDto) {
    return this.service.closeConversation(id, dto.customerToken);
  }

  // --- Panel admin ---

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('chat.respond')
  @Get('admin/conversations')
  findAllForAdmin() {
    return this.service.findAllForAdmin();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('chat.respond')
  @Get('admin/conversations/:id/messages')
  getMessagesForAdmin(@Param('id') id: string) {
    return this.service.getMessagesForAdmin(id);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('chat.respond')
  @Post('admin/conversations/:id/messages')
  sendAdminMessage(@Param('id') id: string, @Body() dto: AdminSendMessageDto) {
    return this.service.sendAdminMessage(id, dto.content);
  }
}
