import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './entities/order.entity';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  // El listado de pedidos y las estadísticas son solo para el panel admin
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.manage')
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.service.findAll(status);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.manage')
  @Get('stats/most-sold')
  mostSold() {
    return this.service.mostSold();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.manage')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Crear pedido es público: lo hace el cliente desde el carrito
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('orders.manage')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
