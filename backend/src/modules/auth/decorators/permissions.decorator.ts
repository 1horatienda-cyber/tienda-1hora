import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../../roles/permissions.constant';

export const PERMISSIONS_KEY = 'permissions';

// Requiere que el usuario tenga AL MENOS UNO de los permisos indicados.
// Uso: @RequirePermissions('products.create') en un método, junto con @UseGuards(AdminAuthGuard, PermissionsGuard).
export const RequirePermissions = (...permissions: PermissionKey[]) => SetMetadata(PERMISSIONS_KEY, permissions);
