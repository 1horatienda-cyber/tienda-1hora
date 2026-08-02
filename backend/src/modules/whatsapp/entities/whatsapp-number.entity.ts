import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum WhatsAppNumberStatus {
  CONECTADO = 'conectado',
  DESCONECTADO = 'desconectado',
  PENDIENTE = 'pendiente',
  ERROR = 'error',
}

@Entity('whatsapp_numbers')
export class WhatsAppNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: WhatsAppNumberStatus, default: WhatsAppNumberStatus.PENDIENTE })
  status: WhatsAppNumberStatus;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'whatsapp_number_operators',
    joinColumn: { name: 'whatsappNumberId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  operators: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
