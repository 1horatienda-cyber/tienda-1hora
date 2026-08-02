import { User, UserRole } from '../users/entities/user.entity';
import { ALL_PERMISSION_KEYS, PermissionKey } from './permissions.constant';

// La cuenta administradora original (creada desde las variables de entorno al arrancar
// el backend) siempre tiene acceso total, sin importar qué roles tenga asignados.
// Todo el resto de usuarios depende exclusivamente de los permisos de sus roles.
export function computeEffectivePermissions(user: User): PermissionKey[] {
  if (user.role === UserRole.ADMIN) return ALL_PERMISSION_KEYS;
  const set = new Set<PermissionKey>();
  for (const role of user.roles ?? []) {
    for (const permission of role.permissions ?? []) set.add(permission);
  }
  return Array.from(set);
}
