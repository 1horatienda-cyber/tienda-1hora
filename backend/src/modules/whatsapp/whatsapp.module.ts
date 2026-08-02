import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppNumber } from './entities/whatsapp-number.entity';
import { User } from '../users/entities/user.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WhatsAppNumber, User])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
