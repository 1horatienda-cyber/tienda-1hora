import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  private slugify(name: string): string {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  async create(dto: CreateCategoryDto) {
    const category = this.repo.create({ ...dto, slug: this.slugify(dto.name) });
    return this.repo.save(category);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: string) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    category.isActive = false;
    return this.repo.save(category);
  }
}
