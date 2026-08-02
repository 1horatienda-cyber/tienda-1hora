import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum MovementType {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  // Preparado para vincular con el usuario admin que hizo el movimiento
  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
