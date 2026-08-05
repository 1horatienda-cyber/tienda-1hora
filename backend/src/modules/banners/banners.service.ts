import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

// Banners con los que arrancó la tienda (los que ya estaban puestos en el carrusel).
// Se siembran una sola vez, la primera vez que arranca el backend con la tabla vacía;
// después de eso todo se administra desde /admin/banners.
// Nota: estos banners son diseños horizontales (no traen una versión vertical dedicada),
// así que imageUrlMobile queda vacío a propósito — en el celular se usa esta misma imagen
// completa (sin recortar) para no perder el título, precio ni productos relacionados.
// El día que tengan un diseño vertical (1080x1350) para alguno, se sube desde /admin/banners.
const INITIAL_BANNERS: { imageUrl: string; href: string; order: number }[] = [
  { imageUrl: '/banners/banner-1-desktop.webp', href: '/catalogo?category=cables', order: 0 },
  { imageUrl: '/banners/banner-2-desktop.webp', href: '/catalogo?category=cargadores-30w-65w-carga-rapida', order: 1 },
  { imageUrl: '/banners/banner-3-desktop.webp', href: '/catalogo?category=bocinas-bluetooth', order: 2 },
  { imageUrl: '/banners/banner-4-desktop.webp', href: '/catalogo', order: 3 },
  { imageUrl: '/banners/banner-5-desktop.webp', href: '/catalogo?category=power-bank', order: 4 },
  { imageUrl: '/banners/banner-6-desktop.webp', href: '/catalogo?category=cables', order: 5 },
  { imageUrl: '/banners/banner-7-desktop.webp', href: '/catalogo?category=bocinas-bluetooth', order: 6 },
  { imageUrl: '/banners/banner-8-desktop.webp', href: '/catalogo?category=audifonos-bluetooth', order: 7 },
];

@Injectable()
export class BannersService implements OnModuleInit {
  constructor(
    @InjectRepository(Banner)
    private readonly bannersRepo: Repository<Banner>,
  ) {}

  async onModuleInit() {
    const count = await this.bannersRepo.count();
    if (count > 0) return;
    for (const banner of INITIAL_BANNERS) {
      await this.bannersRepo.save(this.bannersRepo.create(banner));
    }
  }

  findAllActive() {
    return this.bannersRepo.find({ where: { isActive: true }, order: { order: 'ASC' } });
  }

  findAllForAdmin() {
    return this.bannersRepo.find({ order: { order: 'ASC' } });
  }

  async create(dto: CreateBannerDto) {
    let order = dto.order;
    if (order === undefined) {
      const last = await this.bannersRepo.find({ order: { order: 'DESC' }, take: 1 });
      order = (last[0]?.order ?? -1) + 1;
    }
    const banner = this.bannersRepo.create({
      imageUrl: dto.imageUrl,
      imageUrlMobile: dto.imageUrlMobile || null,
      href: dto.href || '/catalogo',
      order,
    });
    return this.bannersRepo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannersRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner no encontrado');
    Object.assign(banner, dto);
    // Un valor vacío en imageUrlMobile significa "quitar la versión móvil" (volver al fallback)
    if (dto.imageUrlMobile !== undefined && !dto.imageUrlMobile) banner.imageUrlMobile = null;
    return this.bannersRepo.save(banner);
  }

  async remove(id: string) {
    const banner = await this.bannersRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner no encontrado');
    await this.bannersRepo.remove(banner);
    return { ok: true };
  }
}
