import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ChatConversation, ChatConversationStatus } from './entities/chat-conversation.entity';
import { ChatMessage, ChatSender } from './entities/chat-message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationsRepo: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepo: Repository<ChatMessage>,
  ) {}

  private async findConversationOrThrow(id: string) {
    const conversation = await this.conversationsRepo.findOne({ where: { id } });
    if (!conversation) throw new NotFoundException('Conversación no encontrada');
    return conversation;
  }

  private assertOwnsConversation(conversation: ChatConversation, customerToken: string | undefined) {
    if (!customerToken || conversation.customerToken !== customerToken) {
      throw new ForbiddenException('Token de conversación inválido');
    }
  }

  // --- Lado cliente (público, validado por customerToken) ---

  async createConversation(dto: CreateConversationDto) {
    const conversation = this.conversationsRepo.create({
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerToken: randomUUID(),
    });
    return this.conversationsRepo.save(conversation);
  }

  async sendCustomerMessage(conversationId: string, customerToken: string, content: string) {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertOwnsConversation(conversation, customerToken);

    const message = await this.messagesRepo.save(
      this.messagesRepo.create({ conversationId, sender: ChatSender.CLIENTE, content, read: false }),
    );
    await this.conversationsRepo.save(conversation); // marca la conversación como recién actualizada
    return message;
  }

  async getMessagesForCustomer(conversationId: string, customerToken: string | undefined) {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertOwnsConversation(conversation, customerToken);

    const messages = await this.messagesRepo.find({ where: { conversationId }, order: { createdAt: 'ASC' } });
    await this.messagesRepo.update({ conversationId, sender: ChatSender.ADMIN, read: false }, { read: true });
    return messages;
  }

  async closeConversation(conversationId: string, customerToken: string) {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertOwnsConversation(conversation, customerToken);
    conversation.status = ChatConversationStatus.CERRADA;
    await this.conversationsRepo.save(conversation);
    return { ok: true };
  }

  // --- Panel admin ---

  async findAllForAdmin() {
    const conversations = await this.conversationsRepo.find({ order: { updatedAt: 'DESC' } });

    return Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await this.messagesRepo.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' },
        });
        const unreadCount = await this.messagesRepo.count({
          where: { conversationId: conversation.id, sender: ChatSender.CLIENTE, read: false },
        });
        return {
          id: conversation.id,
          customerName: conversation.customerName,
          customerPhone: conversation.customerPhone,
          status: conversation.status,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessage: lastMessage?.content ?? null,
          unreadCount,
        };
      }),
    );
  }

  async getMessagesForAdmin(conversationId: string) {
    await this.findConversationOrThrow(conversationId);
    const messages = await this.messagesRepo.find({ where: { conversationId }, order: { createdAt: 'ASC' } });
    await this.messagesRepo.update({ conversationId, sender: ChatSender.CLIENTE, read: false }, { read: true });
    return messages;
  }

  async sendAdminMessage(conversationId: string, content: string) {
    const conversation = await this.findConversationOrThrow(conversationId);
    const message = await this.messagesRepo.save(
      this.messagesRepo.create({ conversationId, sender: ChatSender.ADMIN, content, read: false }),
    );
    await this.conversationsRepo.save(conversation);
    return message;
  }
}
