import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

// Guard reutilizable para proteger cualquier ruta de administración.
// Uso: @UseGuards(AdminAuthGuard) en el controlador o método correspondiente.
@Injectable()
export class AdminAuthGuard extends PassportAuthGuard('jwt') {}
