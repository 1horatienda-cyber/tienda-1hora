import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('banners')
export class BannersController {
  constructor(private readonly service: BannersService) {}

  // Público: lo usa la portada para armar el carrusel
  @Get()
  findAllActive() {
    return this.service.findAllActive();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('banners.manage')
  @Get('admin')
  findAllForAdmin() {
    return this.service.findAllForAdmin();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('banners.manage')
  @Post()
  create(@Body() dto: CreateBannerDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('banners.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('banners.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
