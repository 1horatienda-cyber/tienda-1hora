import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { suggestRetailPriceInCents } from './pricing.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  findAll(params: { categorySlug?: string; search?: string; featured?: boolean; isNew?: boolean }) {
    const qb = this.productsRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.isActive = true');

    if (params.categorySlug) {
      qb.andWhere('category.slug = :slug', { slug: params.categorySlug });
    }
    if (params.search) {
      qb.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)', {
        search: `%${params.search}%`,
      });
    }
    if (params.featured) {
      qb.andWhere('product.isFeatured = true');
    }
    if (params.isNew) {
      qb.andWhere('product.isNew = true');
    }

    return qb.orderBy('product.createdAt', 'DESC').getMany();
  }

  // El panel admin necesita ver también los productos inactivos (dados de baja)
  findAllForAdmin() {
    return this.productsRepo.find({
      relations: ['images', 'category', 'inventory'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug },
      relations: ['images', 'category', 'inventory'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findRelated(productId: string, categoryId: string) {
    if (!categoryId) return [];
    return this.productsRepo.find({
      where: { categoryId, isActive: true },
      relations: ['images'],
      take: 4,
    });
  }

  async create(dto: CreateProductDto) {
    const product = this.productsRepo.create({
      ...dto,
      slug: this.slugify(dto.name),
      wholesaleMinQty: dto.wholesaleMinQty ?? 3,
      retailPriceInCents: dto.retailPriceInCents ?? suggestRetailPriceInCents(dto.priceInCents),
    });
    const saved = await this.productsRepo.save(product);

    // Cada producto nuevo arranca con un registro de inventario en cero
    const inventory = this.inventoryRepo.create({
      productId: saved.id,
      quantityAvailable: 0,
    });
    await this.inventoryRepo.save(inventory);

    return saved;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    Object.assign(product, dto);
    if (dto.name) product.slug = this.slugify(dto.name);
    return this.productsRepo.save(product);
  }

  // Borrado real (no lógico): las relaciones ya están preparadas para esto —
  // imágenes e inventario se borran en cascada, y los pedidos pasados conservan
  // su nombre/precio "congelados" (product_items.productId simplemente queda en null).
  async remove(id: string) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.productsRepo.remove(product);
    return { ok: true };
  }
}
