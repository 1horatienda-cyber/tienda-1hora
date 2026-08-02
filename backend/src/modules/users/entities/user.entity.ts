import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export enum UserRole {
  ADMIN = 'admin', // cuenta administradora original (creada desde variables de entorno); siempre tiene acceso total
  STAFF = 'staff', // empleados creados desde el panel; su acceso real lo definen los roles asignados
  CUSTOMER = 'customer', // preparado para registro de clientes en el futuro
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  // Para el flujo de "olvidé mi contraseña": nunca se guarda el token en texto plano,
  // solo su hash. Ambos quedan en null en cuanto se usa o se pide uno nuevo.
  @Column({ nullable: true, type: 'varchar' })
  passwordResetTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpiresAt: Date | null;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;
}
