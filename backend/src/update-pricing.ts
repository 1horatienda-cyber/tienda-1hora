import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Product } from './modules/products/entities/product.entity';
import { Category } from './modules/categories/entities/category.entity';
import { ProductImage } from './modules/products/entities/product-image.entity';
import { Inventory } from './modules/inventory/entities/inventory.entity';
import { suggestRetailPriceInCents } from './modules/products/pricing.util';
import { CATALOG_PRICING } from './catalog-pricing';

dotenv.config();

// Aplica (o vuelve a aplicar) los precios de catalog-pricing.ts a productos que ya
// existen en la base de datos, identificándolos por SKU. Útil si cambias algo en
// catalog-pricing.ts y quieres que se refleje sin tener que re-sembrar todo.
async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Category, Product, ProductImage, Inventory],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Conectado a la base de datos.');

  const productRepo = dataSource.getRepository(Product);
  let updated = 0;
  let skipped = 0;

  for (const row of CATALOG_PRICING) {
    const product = await productRepo.findOne({ where: { sku: row.sku } });
    if (!product) {
      console.log(`No encontrado (se omite): ${row.sku}`);
      skipped++;
      continue;
    }

    const wholesaleInCents = row.wholesale * 100;
    product.priceInCents = wholesaleInCents;
    product.wholesaleMinQty = row.minQty;
    product.retailPriceInCents = suggestRetailPriceInCents(wholesaleInCents);
    product.boxQuantity = row.boxQty ?? null;
    product.boxPriceInCents = row.box ? row.box * 100 : null;

    await productRepo.save(product);
    updated++;
    console.log(
      `${row.sku}: detalle RD$${(product.retailPriceInCents / 100).toFixed(0)} | mayor (${row.minQty}+) RD$${row.wholesale} | caja x${row.boxQty ?? '-'} RD$${row.box ?? '-'}`,
    );
  }

  await dataSource.destroy();
  console.log(`Listo. ${updated} productos actualizados, ${skipped} no encontrados.`);
}

run().catch((err) => {
  console.error('Error al actualizar precios:', err);
  process.exit(1);
});
