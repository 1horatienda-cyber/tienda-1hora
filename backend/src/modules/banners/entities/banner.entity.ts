import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Imagen para pantallas medianas/grandes. Recomendado 1920x960 (2:1) o 1920x800.
  // Igual que las fotos de producto: el archivo se copia a mano a
  // frontend/public/banners/ y aquí se guarda la ruta.
  @Column()
  imageUrl: string;

  // Imagen opcional recortada para celulares, en vertical (recomendado 1080x1350).
  // Si se deja vacía, en el celular se usa la misma imagen de arriba, completa y sin
  // recortar (achicada para que quepa el ancho de la pantalla) — así nunca se pierde
  // texto ni información importante del banner.
  @Column({ nullable: true, type: 'varchar' })
  imageUrlMobile: string | null;

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
