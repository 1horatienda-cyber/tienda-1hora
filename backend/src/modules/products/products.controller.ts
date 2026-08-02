import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminAuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('category') categorySlug?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('new') isNew?: string,
  ) {
    return this.productsService.findAll({
      categorySlug,
      search,
      featured: featured === 'true',
      isNew: isNew === 'true',
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    const related = await this.productsService.findRelated(product.id, product.categoryId);
    return { ...product, related };
  }

  // Rutas de administración — protegidas, requieren sesión de administrador
  @UseGuards(AdminAuthGuard)
  @Get('admin/all')
  findAllForAdmin() {
    return this.productsService.findAllForAdmin();
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequirePermissions('products.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
