import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Ruta o URL de la imagen. Por ahora, igual que las fotos de producto, el
  // archivo se copia a mano a frontend/public/banners/ y aquí se guarda la ruta.
  @Column()
  imageUrl: string;

  // A dónde lleva al hacer clic (ej: /catalogo?category=cables)
  @Column({ default: '/catalogo' })
  href: string;

  @Column({ default: true })
  isActive: boolean;

  // Orden de aparición en el carrusel (menor primero)
  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
