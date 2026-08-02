import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

// Administrar roles y permisos es exclusivo de quien tiene acceso a configuraciones.
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @RequirePermissions('settings.access')
  @Get('permissions-catalog')
  getPermissionsCatalog() {
    return this.service.getPermissionsCatalog();
  }

  @RequirePermissions('settings.access')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('settings.access')
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('settings.access')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('settings.access')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
