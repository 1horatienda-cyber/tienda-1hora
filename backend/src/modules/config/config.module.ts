import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreConfig } from './entities/store-config.entity';
import { StoreConfigService } from './config.service';
import { StoreConfigController } from './config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreConfig])],
  controllers: [StoreConfigController],
  providers: [StoreConfigService],
  exports: [StoreConfigService],
})
export class StoreConfigModule {}
