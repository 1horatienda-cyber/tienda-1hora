import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Se usa una única fila de esta tabla para toda la configuración de la tienda.
@Entity('store_config')
export class StoreConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessName: string;

  @Column()
  whatsappNumber: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  businessHours: string;

  @Column({ type: 'text', nullable: true })
  shippingInfo: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Record<string, string>;
}
