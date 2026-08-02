import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  productId: string;

  // Snapshot: si el producto cambia de nombre/precio después, el pedido conserva el original
  @Column()
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  unitPriceInCents: number;

  @Column({ type: 'int' })
  subtotalInCents: number;
}
