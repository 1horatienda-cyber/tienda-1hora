import { IsString, IsInt, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  // Precio "al por mayor" (desde wholesaleMinQty unidades)
  @IsInt()
  @Min(0)
  priceInCents: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  wholesaleMinQty?: number;

  // Precio "al detalle" (1-2 unidades). Si no se manda, se sugiere automáticamente
  // aplicando un margen sobre priceInCents (ver pricing.util.ts).
  @IsInt()
  @Min(0)
  @IsOptional()
  retailPriceInCents?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  boxQuantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  boxPriceInCents?: number;

  @IsString()
  sku: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;
}
