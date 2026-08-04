import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Precio "al por mayor" (desde wholesaleMinQty unidades), en centavos RD$.
  // Es el precio que ya traía el catálogo mayorista de 1Hora.
  @Column({ type: 'int' })
  priceInCents: number;

  // Cantidad mínima para pagar priceInCents (normalmente 3, a veces 2 o 6 según el producto)
  @Column({ type: 'int', default: 3 })
  wholesaleMinQty: number;

  // Precio "al detalle" (1-2 unidades). El catálogo mayorista no trae este precio —
  // se calcula con un margen sobre el precio al por mayor (ver backend/src/pricing.ts).
  // Nullable solo para permitir agregar la columna sin romper productos ya existentes;
  // en la práctica siempre se llena al crear o actualizar un producto.
  @Column({ type: 'int', nullable: true })
  retailPriceInCents: number | null;

  // Precio y cantidad de la subcaja/caja completa (el precio más bajo por unidad).
  // Quedan en null si el catálogo no trae precio de caja para ese producto.
  @Column({ type: 'int', nullable: true })
  boxQuantity: number | null;

  @Column({ type: 'int', nullable: true })
  boxPriceInCents: number | null;

  // Código interno del producto (para el cliente y para inventario)
  @Column({ unique: true })
  sku: string;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isNew: boolean;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToOne(() => Inventory, (inventory) => inventory.product, { cascade: true })
  inventory: Inventory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
