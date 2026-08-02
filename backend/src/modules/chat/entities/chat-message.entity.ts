import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';

export enum ChatSender {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => ChatConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: ChatConversation;

  @Column({ type: 'enum', enum: ChatSender })
  sender: ChatSender;

  @Column({ type: 'text' })
  content: string;

  // Si ya lo vio la otra parte: el admin para mensajes del cliente, el cliente para mensajes del admin.
  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
