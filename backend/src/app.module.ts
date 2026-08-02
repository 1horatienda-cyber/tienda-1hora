import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { StoreConfigModule } from './modules/config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { RolesModule } from './modules/roles/roles.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BannersModule } from './modules/banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        // synchronize solo para desarrollo; en producción se usan migraciones
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    ProductsModule,
    CategoriesModule,
    InventoryModule,
    OrdersModule,
    UsersModule,
    StoreConfigModule,
    AuthModule,
    ChatModule,
    RolesModule,
    WhatsappModule,
    BannersModule,
  ],
})
export class AppModule {}
