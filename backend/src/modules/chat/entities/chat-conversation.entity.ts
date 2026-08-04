import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ChatConversationStatus {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

@Entity('chat_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  // Token que el navegador del cliente guarda (localStorage) para poder
  // enviar y leer mensajes de su conversación sin necesidad de una cuenta.
  @Column({ unique: true })
  customerToken: string;

  @Column({ type: 'enum', enum: ChatConversationStatus, default: ChatConversationStatus.ABIERTA })
  status: ChatConversationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
