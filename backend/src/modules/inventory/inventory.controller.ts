import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RegisterMovementDto } from './dto/register-movement.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

// Todo el módulo de inventario es de uso exclusivo del panel admin
@UseGuards(AdminAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('low-stock')
  lowStock() {
    return this.service.findLowStock();
  }

  @Get('out-of-stock')
  outOfStock() {
    return this.service.findOutOfStock();
  }

  @Get(':productId/history')
  history(@Param('productId') productId: string) {
    return this.service.history(productId);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermissions('inventory.manage')
  @Post('movements')
  registerMovement(@Body() dto: RegisterMovementDto) {
    return this.service.registerMovement(dto);
  }
}
