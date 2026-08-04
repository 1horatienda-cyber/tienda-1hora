import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { StoreConfigService } from './config.service';
import { StoreConfig } from './entities/store-config.entity';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('store-config')
export class StoreConfigController {
  constructor(private readonly service: StoreConfigService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('settings.access')
  @Patch()
  update(@Body() data: Partial<StoreConfig>) {
    return this.service.update(data);
  }
}
