import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Product, (product) => product.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'int', default: 0 })
  quantityAvailable: number;

  // Debajo de este número se muestra alerta de poco inventario
  @Column({ type: 'int', default: 5 })
  lowStockThreshold: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
