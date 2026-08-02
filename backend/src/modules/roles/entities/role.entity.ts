import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PermissionKey } from '../permissions.constant';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions: PermissionKey[];

  // Los roles semilla (Administrador, Operador, Atención al Cliente) no se pueden eliminar.
  @Column({ default: false })
  isSystem: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
