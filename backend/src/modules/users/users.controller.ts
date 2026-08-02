import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

interface AuthedRequest extends Request {
  user: { userId: string; email: string };
}

const VIEW_USERS = ['users.create', 'users.edit', 'users.delete'] as const;

@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  // Lista mínima (id, nombre, correo) de todo el staff activo, para selectores de
  // asignación (p. ej. operadores de un número de WhatsApp). No requiere permisos
  // de administración de usuarios: cualquier miembro del staff autenticado puede verla.
  @Get('assignable')
  findAssignable() {
    return this.service.findAssignable();
  }

  @RequirePermissions(...VIEW_USERS)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll({
      search,
      roleId,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @RequirePermissions(...VIEW_USERS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('users.create')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('users.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('users.edit')
  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean, @Req() req: AuthedRequest) {
    return this.service.setActive(id, isActive, req.user.userId);
  }

  @RequirePermissions('users.edit')
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(id, dto.newPassword);
  }

  @RequirePermissions('users.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.service.remove(id, req.user.userId);
  }
}
