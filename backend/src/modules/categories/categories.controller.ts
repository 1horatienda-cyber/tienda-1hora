import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Las categorías se administran junto con los productos ("crear categorías al vuelo"),
  // así que comparten los mismos permisos que el catálogo.
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.edit')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
