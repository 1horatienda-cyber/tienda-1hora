import { Controller, Get, Patch, Body } from '@nestjs/common';
import { StoreConfigService } from './config.service';
import { StoreConfig } from './entities/store-config.entity';

@Controller('store-config')
export class StoreConfigController {
  constructor(private readonly service: StoreConfigService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  update(@Body() data: Partial<StoreConfig>) {
    return this.service.update(data);
  }
}
