import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

// Banners con los que arrancó la tienda (los que ya estaban puestos en el carrusel).
// Se siembran una sola vez, la primera vez que arranca el backend con la tabla vacía;
// después de eso todo se administra desde /admin/banners.
const INITIAL_BANNERS: { imageUrl: string; href: string; order: number }[] = [
  { imageUrl: '/banners/banner-1.jpg', href: '/catalogo?category=cables', order: 0 },
  { imageUrl: '/banners/banner-2.jpg', href: '/catalogo?category=cargadores-30w-65w-carga-rapida', order: 1 },
  { imageUrl: '/banners/banner-3.jpg', href: '/catalogo?category=bocinas-bluetooth', order: 2 },
  { imageUrl: '/banners/banner-4.jpg', href: '/catalogo', order: 3 },
  { imageUrl: '/banners/banner-5.jpg', href: '/catalogo?category=power-bank', order: 4 },
  { imageUrl: '/banners/banner-6.jpg', href: '/catalogo?category=cables', order: 5 },
  { imageUrl: '/banners/banner-7.jpg', href: '/catalogo?category=bocinas-bluetooth', order: 6 },
  { imageUrl: '/banners/banner-8.jpg', href: '/catalogo?category=audifonos-bluetooth', order: 7 },
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
    const banner = this.bannersRepo.create({ imageUrl: dto.imageUrl, href: dto.href || '/catalogo', order });
    return this.bannersRepo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannersRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner no encontrado');
    Object.assign(banner, dto);
    return this.bannersRepo.save(banner);
  }

  async remove(id: string) {
    const banner = await this.bannersRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner no encontrado');
    await this.bannersRepo.remove(banner);
    return { ok: true };
  }
}
