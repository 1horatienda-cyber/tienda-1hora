import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { CreateWhatsAppNumberDto } from './dto/create-whatsapp-number.dto';
import { UpdateWhatsAppNumberDto } from './dto/update-whatsapp-number.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('whatsapp-numbers')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  // Ver la lista alcanza con poder atender o administrar (para que Atención al Cliente
  // también vea a qué número/operador está asignada cada conversación).
  @RequirePermissions('whatsapp.manage', 'whatsapp.respond')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @RequirePermissions('whatsapp.manage')
  @Post()
  create(@Body() dto: CreateWhatsAppNumberDto) {
    return this.service.create(dto);
  }

  @RequirePermissions('whatsapp.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWhatsAppNumberDto) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('whatsapp.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
