import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';
import { RegisterMovementDto } from './dto/register-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementsRepo: Repository<InventoryMovement>,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .orderBy('inventory.quantityAvailable', 'ASC')
      .getMany();
  }

  findLowStock() {
    return this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.quantityAvailable <= inventory.lowStockThreshold')
      .getMany();
  }

  findOutOfStock() {
    return this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.quantityAvailable = 0')
      .getMany();
  }

  history(productId: string) {
    return this.movementsRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  // Registra un movimiento y actualiza el stock en una sola transacción,
  // para que nunca queden desincronizados el historial y la cantidad disponible.
  async registerMovement(dto: RegisterMovementDto, createdBy?: string) {
    return this.dataSource.transaction(async (manager) => {
      const inventory = await manager.findOne(Inventory, { where: { productId: dto.productId } });
      if (!inventory) throw new NotFoundException('No existe inventario para este producto');

      if (dto.type === MovementType.SALIDA && inventory.quantityAvailable < dto.quantity) {
        throw new BadRequestException('No hay suficiente stock disponible');
      }

      if (dto.type === MovementType.ENTRADA) {
        inventory.quantityAvailable += dto.quantity;
      } else if (dto.type === MovementType.SALIDA) {
        inventory.quantityAvailable -= dto.quantity;
      } else {
        inventory.quantityAvailable = dto.quantity; // ajuste = valor absoluto nuevo
      }

      await manager.save(inventory);

      const movement = manager.create(InventoryMovement, {
        ...dto,
        createdBy,
      });
      return manager.save(movement);
    });
  }

  // Usado internamente por Orders al confirmar un pedido
  async decrementStock(productId: string, quantity: number, manager = this.dataSource.manager) {
    const inventory = await manager.findOne(Inventory, { where: { productId } });
    if (!inventory || inventory.quantityAvailable < quantity) {
      throw new BadRequestException('Stock insuficiente para completar el pedido');
    }
    inventory.quantityAvailable -= quantity;
    await manager.save(inventory);

    const movement = manager.create(InventoryMovement, {
      productId,
      type: MovementType.SALIDA,
      quantity,
      reason: 'Venta (pedido confirmado)',
    });
    await manager.save(movement);
  }
}
