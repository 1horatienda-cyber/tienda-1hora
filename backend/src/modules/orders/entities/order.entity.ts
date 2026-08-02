import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum DeliveryType {
  RETIRO_LOCAL = 'retiro_local',
  ENVIO_NEGOCIO = 'envio_negocio',
  ENVIO_DOMICILIO = 'envio_domicilio',
}

export enum OrderStatus {
  RECIBIDO = 'recibido',
  PREPARANDO = 'preparando',
  LISTO_PARA_RETIRAR = 'listo_para_retirar',
  EN_CAMINO = 'en_camino',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  customerWhatsapp: string;

  @Column({ type: 'enum', enum: DeliveryType })
  deliveryType: DeliveryType;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.RECIBIDO })
  status: OrderStatus;

  // Total en centavos (RD$)
  @Column({ type: 'int' })
  totalInCents: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
