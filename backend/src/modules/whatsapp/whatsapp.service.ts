import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WhatsAppNumber } from './entities/whatsapp-number.entity';
import { User } from '../users/entities/user.entity';
import { CreateWhatsAppNumberDto } from './dto/create-whatsapp-number.dto';
import { UpdateWhatsAppNumberDto } from './dto/update-whatsapp-number.dto';

// Límite inicial pedido: hasta 5 números. Es solo una validación de esta capa de servicio
// (no una restricción de base de datos), así que subirlo en el futuro es cambiar esta constante.
const MAX_WHATSAPP_NUMBERS = 5;

@Injectable()
export class WhatsappService {
  constructor(
    @InjectRepository(WhatsAppNumber)
    private readonly numbersRepo: Repository<WhatsAppNumber>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findAll() {
    return this.numbersRepo.find({ relations: ['operators'], order: { createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const number = await this.numbersRepo.findOne({ where: { id }, relations: ['operators'] });
    if (!number) throw new NotFoundException('Número no encontrado');
    return number;
  }

  private async resolveOperators(operatorIds: string[] | undefined) {
    if (!operatorIds) return undefined;
    if (operatorIds.length === 0) return [];
    const operators = await this.usersRepo.find({ where: { id: In(operatorIds) } });
    if (operators.length !== operatorIds.length) {
      throw new BadRequestException('Uno o más operadores seleccionados no existen');
    }
    return operators;
  }

  private async clearOtherPrimaries(exceptId?: string) {
    const query = this.numbersRepo.createQueryBuilder().update(WhatsAppNumber).set({ isPrimary: false });
    if (exceptId) query.where('id != :exceptId', { exceptId });
    await query.execute();
  }

  async create(dto: CreateWhatsAppNumberDto) {
    const count = await this.numbersRepo.count();
    if (count >= MAX_WHATSAPP_NUMBERS) {
      throw new BadRequestException(`Solo se permiten hasta ${MAX_WHATSAPP_NUMBERS} números por ahora`);
    }

    const existing = await this.numbersRepo.findOne({ where: { phoneNumber: dto.phoneNumber } });
    if (existing) throw new ConflictException('Ese número ya está registrado');

    const operators = await this.resolveOperators(dto.operatorIds);
    // El primer número que se agrega queda como principal automáticamente.
    const makePrimary = count === 0 || dto.isPrimary === true;

    const number = this.numbersRepo.create({
      phoneNumber: dto.phoneNumber,
      label: dto.label,
      isPrimary: makePrimary,
      operators,
    });
    const saved = await this.numbersRepo.save(number);

    if (makePrimary) await this.clearOtherPrimaries(saved.id);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateWhatsAppNumberDto) {
    const number = await this.findOne(id);

    if (dto.isPrimary === false) {
      throw new BadRequestException('Para quitar el número principal, marca otro número como principal');
    }
    if (dto.phoneNumber && dto.phoneNumber !== number.phoneNumber) {
      const existing = await this.numbersRepo.findOne({ where: { phoneNumber: dto.phoneNumber } });
      if (existing) throw new ConflictException('Ese número ya está registrado');
      number.phoneNumber = dto.phoneNumber;
    }
    if (dto.label !== undefined) number.label = dto.label;
    if (dto.isActive !== undefined) number.isActive = dto.isActive;
    if (dto.status !== undefined) number.status = dto.status;
    if (dto.operatorIds !== undefined) {
      number.operators = (await this.resolveOperators(dto.operatorIds)) ?? [];
    }
    if (dto.isPrimary === true) number.isPrimary = true;

    await this.numbersRepo.save(number);
    if (dto.isPrimary === true) await this.clearOtherPrimaries(id);

    return this.findOne(id);
  }

  async remove(id: string) {
    const number = await this.findOne(id);
    await this.numbersRepo.remove(number);
    return { ok: true };
  }
}
