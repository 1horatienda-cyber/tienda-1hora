import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { CreateWhatsAppNumberDto } from './dto/create-whatsapp-number.dto';
import { UpdateWhatsAppNumberDto } from './dto/update-whatsapp-number.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('whatsapp-numbers')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  // Público: números activos para mostrar en la página de Contacto (sin datos internos).
  @Get('public')
  findPublic() {
    return this.service.findPublic();
  }

  // Ver la lista completa alcanza con poder atender o administrar (para que Atención al
  // Cliente también vea a qué número/operador está asignada cada conversación).
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('whatsapp.manage', 'whatsapp.respond')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('whatsapp.manage')
  @Post()
  create(@Body() dto: CreateWhatsAppNumberDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('whatsapp.manage')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWhatsAppNumberDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('whatsapp.manage')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
