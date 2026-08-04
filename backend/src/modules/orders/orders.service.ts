import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryMovement, MovementType } from '../inventory/entities/inventory-movement.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { unitPriceForQuantity } from '../products/pricing.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(status?: OrderStatus) {
    return this.ordersRepo.find({
      where: status ? { status } : {},
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  // Crea el pedido, valida stock y descuenta inventario, todo en una transacción:
  // si algo falla (p. ej. no hay stock de un producto) no se guarda nada a medias.
  async create(dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      let totalInCents = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const product = await manager.findOne(Product, { where: { id: item.productId } });
        if (!product || !product.isActive) {
          throw new BadRequestException(`Producto no disponible: ${item.productId}`);
        }

        const inventory = await manager.findOne(Inventory, { where: { productId: product.id } });
        if (!inventory || inventory.quantityAvailable < item.quantity) {
          throw new BadRequestException(`Sin stock suficiente para ${product.name}`);
        }

        inventory.quantityAvailable -= item.quantity;
        await manager.save(inventory);

        await manager.save(
          manager.create(InventoryMovement, {
            productId: product.id,
            type: MovementType.SALIDA,
            quantity: item.quantity,
            reason: 'Venta (pedido confirmado)',
          }),
        );

        // Precio por unidad según la cantidad comprada: detalle (1-2), por mayor (desde
        // wholesaleMinQty) o de caja (si la cantidad alcanza para una caja completa).
        const unitPriceInCents = unitPriceForQuantity(product, item.quantity);
        const subtotal = unitPriceInCents * item.quantity;
        totalInCents += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPriceInCents,
          subtotalInCents: subtotal,
        });
      }

      const order = manager.create(Order, {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerWhatsapp: dto.customerWhatsapp,
        deliveryType: dto.deliveryType,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        totalInCents,
        status: OrderStatus.RECIBIDO,
        items: orderItems as OrderItem[],
      });

      return manager.save(order);
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepo.save(order);
  }

  // Estadísticas básicas para el panel admin
  async mostSold(limit = 5) {
    return this.dataSource
      .getRepository(OrderItem)
      .createQueryBuilder('item')
      .select('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .groupBy('item.productName')
      .orderBy('"totalSold"', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
