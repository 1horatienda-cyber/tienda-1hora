import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionKey } from '../../roles/permissions.constant';

// Se usa después de AdminAuthGuard: ese guard valida el JWT y deja el usuario (con sus permisos
// ya calculados por JwtStrategy) en request.user. Este guard solo revisa si alcanza para la ruta.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    const permissions: string[] = user?.permissions ?? [];
    const allowed = required.some((p) => permissions.includes(p));
    if (!allowed) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }
    return true;
  }
}
